import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import mammoth from 'mammoth'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseStorage() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() { },
      },
    }
  )
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 2.5
): Promise<T> {
  let currentDelay = delay
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      const is503 = error.status === 503 || 
                    error.code === 503 || 
                    error.status === 429 || 
                    error.code === 429 ||
                    (error.message && (
                      error.message.includes('503') || 
                      error.message.includes('429') || 
                      error.message.includes('UNAVAILABLE') ||
                      error.message.includes('high demand')
                    ))
      if (i < retries && is503) {
        console.warn(`Upstream Gemini error (503/429/UNAVAILABLE). Retrying in ${currentDelay}ms... (${retries - i} retries left). Error:`, error.message || error)
        await new Promise(resolve => setTimeout(resolve, currentDelay))
        currentDelay *= backoffFactor
        continue
      }
      throw error
    }
  }
  throw new Error('Retries failed')
}

function classifyContractByContent(filename: string, textSnippet = ''): { contractType: string, recommendedPerspective: 'Tenant' | 'Landlord' | 'Buyer' | 'Seller' | 'Neutral' | 'Supplier' } {
  const combined = (filename + ' ' + textSnippet).toLowerCase()
  const cleanText = combined.replace(/[_\-\.\/]/g, ' ')
  
  if (/\b(nda|confidentiality|non-disclosure|disclosure)\b/i.test(cleanText)) {
    return { contractType: 'nda', recommendedPerspective: 'Neutral' }
  }
  
  if (/\b(lease|rent|tenancy|apartment|landlord|tenant|lessee|lessor)\b/i.test(cleanText)) {
    let perspective: 'Tenant' | 'Landlord' | 'Neutral' = 'Neutral'
    if (/\b(tenant|lessee)\b/i.test(cleanText)) {
      perspective = 'Tenant'
    } else if (/\b(landlord|lessor)\b/i.test(cleanText)) {
      perspective = 'Landlord'
    }
    return { contractType: 'lease', recommendedPerspective: perspective }
  }
  
  if (/\b(oem|automotive|component|tooling|line-stoppage|iatf|manufacturing supply)\b/i.test(cleanText)) {
    return { contractType: 'oem_supply', recommendedPerspective: 'Supplier' }
  }
  
  if (/\b(vendor|supply|purchase|distribution|procurement|supplier|seller|merchant|invoice|reseller|sales agreement)\b/i.test(cleanText)) {
    let perspective: 'Buyer' | 'Seller' | 'Neutral' = 'Neutral'
    if (/\b(buyer|purchaser)\b/i.test(cleanText)) {
      perspective = 'Buyer'
    } else if (/\b(supplier|seller|vendor)\b/i.test(cleanText)) {
      perspective = 'Seller'
    }
    return { contractType: 'vendor', recommendedPerspective: perspective }
  }
  
  if (/\b(service|consulting|employment|contractor|freelance|sla|hire|work|job|employer|employee|provider|consultant|client|company)\b/i.test(cleanText)) {
    let perspective: 'Buyer' | 'Seller' | 'Neutral' = 'Neutral'
    if (/\b(client|employer|company|recipient)\b/i.test(cleanText)) {
      perspective = 'Buyer'
    } else if (/\b(provider|consultant|employee|contractor)\b/i.test(cleanText)) {
      perspective = 'Seller'
    }
    return { contractType: 'service', recommendedPerspective: perspective }
  }
  
  return { contractType: 'global', recommendedPerspective: 'Neutral' }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseStorage()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractId } = await req.json()
    if (!contractId) return NextResponse.json({ message: 'Missing contractId' }, { status: 400 })

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId))
    if (!contract) return NextResponse.json({ message: 'Contract not found' }, { status: 404 })

    if (contract.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Download file buffer from Supabase Storage
    const { data, error } = await supabase.storage.from('contracts').download(contract.filePath)
    if (error || !data) throw new Error('Failed to download contract from storage.')
    
    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filename = contract.name.toLowerCase()
    
    // Call Gemini 2.5 Flash to quickly classify
    const systemPrompt = `You are a legal document classifier.
Analyze the provided contract document and return a JSON object matching this schema:
{
  "contractType": "lease" | "nda" | "vendor" | "service" | "global" | "oem_supply",
  "recommendedPerspective": "Tenant" | "Landlord" | "Buyer" | "Seller" | "Neutral" | "Supplier"
}

Pick the contractType that fits best:
- "lease" for rental/lease/tenancy agreements.
- "nda" for non-disclosure or confidentiality agreements.
- "vendor" for supply, distribution, purchase, or vendor agreements.
- "service" for service level agreements, consulting, master service agreements, or employment.
- "oem_supply" for automotive, OEM, component, tooling, line-stoppage, manufacturing supply agreements.
- "global" if it doesn't clearly fit or is generic.

Pick the recommendedPerspective that is the natural user perspective:
- "Tenant" for lease/rentals where the user is the lessee.
- "Landlord" for lease/rentals where the user is the lessor.
- "Buyer" for purchase/procurement where the user buys.
- "Seller" for supplier/sales where the user sells.
- "Supplier" for oem/supply agreements where the user supplies parts or components.
- "Neutral" if it's mutual or balanced (e.g. NDA, joint venture).`

    let responseText = ''
    let fallback = false
    let result: { contractType: string; recommendedPerspective: 'Tenant' | 'Landlord' | 'Buyer' | 'Seller' | 'Neutral' | 'Supplier' }

    try {
      if (filename.endsWith('.pdf')) {
        const base64Data = Buffer.from(buffer).toString('base64')
        const response = await retryWithBackoff(() => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { inlineData: { data: base64Data, mimeType: 'application/pdf' } },
            systemPrompt,
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT" as const,
              properties: {
                contractType: { type: "STRING" as const },
                recommendedPerspective: { type: "STRING" as const },
              },
              required: ["contractType", "recommendedPerspective"],
            }
          }
        }))
        responseText = response.text || ''
      } else {
        let extractedText = ''
        if (filename.endsWith('.docx')) {
          const textResult = await mammoth.extractRawText({ buffer })
          extractedText = textResult.value || ''
        } else {
          extractedText = buffer.toString('utf-8')
        }

        if (extractedText.trim().length < 50) {
          extractedText = `Filename: ${contract.name}\nContext scanning. Please classify this contract type based on file name.`
        }

        const textOverview = extractedText.substring(0, 3000)

        const response = await retryWithBackoff(() => ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            systemPrompt + "\n\nContract Text Snippet:\n" + textOverview,
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT" as const,
              properties: {
                contractType: { type: "STRING" as const },
                recommendedPerspective: { type: "STRING" as const },
              },
              required: ["contractType", "recommendedPerspective"],
            }
          }
        }))
        responseText = response.text || ''
      }

      if (!responseText) throw new Error('Gemini classification returned empty response')
      result = JSON.parse(responseText)
    } catch (geminiError: any) {
      console.warn('Gemini quick-scan failed completely after retries. Using local fallback heuristics. Error:', geminiError)
      fallback = true
      
      let textSnippet = ''
      if (!filename.endsWith('.pdf')) {
        try {
          if (filename.endsWith('.docx')) {
            const textResult = await mammoth.extractRawText({ buffer })
            textSnippet = textResult.value || ''
          } else {
            textSnippet = buffer.toString('utf-8')
          }
        } catch {}
      }
      
      result = classifyContractByContent(contract.name, textSnippet)
    }

    // Persist auto-detected contractType to database
    await db.update(contracts).set({
      contractType: result.contractType,
    }).where(eq(contracts.id, contractId))

    return NextResponse.json({
      success: true,
      contractType: result.contractType,
      recommendedPerspective: result.recommendedPerspective,
      fallback
    })
  } catch (error: any) {
    console.error('Quick scan error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
