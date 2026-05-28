import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts, clauses, profiles, userPlaybook, contractDates } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import mammoth from 'mammoth'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkUsageLimit } from '@/lib/usage'
import pdf from 'pdf-parse'

export const maxDuration = 60 // Vercel serverless timeout limit

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

const RESPONSE_SCHEMA = {
  type: "OBJECT" as const,
  properties: {
    clauses: {
      type: "ARRAY" as const,
      description: "The top 5 to 7 most critical risk clauses.",
      items: {
        type: "OBJECT" as const,
        properties: {
          clauseType: { type: "STRING" as const },
          originalText: { type: "STRING" as const },
          plainEnglish: { type: "STRING" as const },
          riskScore: { type: "INTEGER" as const, description: "Risk score 1 to 10" },
          pageNumber: { type: "INTEGER" as const, description: "The page number in the PDF where this clause appears" },
          recommendation: { type: "STRING" as const },
          negotiationLanguage: { type: "STRING" as const },
          isPlaybookViolation: { type: "BOOLEAN" as const },
        },
        required: ["clauseType", "originalText", "plainEnglish", "riskScore", "pageNumber", "recommendation", "isPlaybookViolation"],
      },
    },
    overallRisk: { type: "INTEGER" as const },
    riskLabel: { type: "STRING" as const },
    summary: { type: "STRING" as const },
    autoRenewalDate: { type: "STRING" as const },
    expirationDate: { type: "STRING" as const },
  },
  required: ["clauses", "overallRisk", "riskLabel", "summary"],
}

function buildSystemInstruction(perspective: string, playbookRules: string, bespokeConstraints: string): string {
  const userPerspective = perspective || 'Neutral'
  return `You are an elite, ruthless corporate lawyer representing the ${userPerspective}. You are exclusively representing the interests of the ${userPerspective}. Ignore risks that only negatively impact the counterparty. Your sole objective is to protect the ${userPerspective} from liability and financial exposure.
CRITICAL INSTRUCTION: You must analyze this contract strictly from the perspective of the ${userPerspective}.
Identify the top 5 to 7 most dangerous clauses that pose a liability, financial threat, or operational risk SPECIFICALLY to the ${userPerspective}.

If a clause heavily benefits the ${userPerspective}, DO NOT flag it as a risk.

If the perspective is 'Neutral', flag risks for both sides equally.

CRITICAL: DO NOT HALLUCINATE DATES OR CLAUSES. If an expiration date, renewal notice, or specific risk clause is not explicitly written in the provided text, you MUST return an empty string "" for those JSON fields. Do not guess or extrapolate dates.

CRITICAL INSTRUCTIONS: 
1. If a clause scores 7 or higher, you MUST generate formal, business-friendly replacement contract language in the negotiationLanguage field, along with a 1-sentence business justification for the change in the recommendation field. 

User's Playbook Non-Negotiables:
${playbookRules}

Bespoke Deal Constraints / Raw Parameters:
${bespokeConstraints}

CRITICAL: If any clause violates the Playbook Non-Negotiables or contradicts the Bespoke Deal Constraints, you MUST flag it. Set isPlaybookViolation to true for that clause in the JSON response. Otherwise, set it to false.

For each clause, provide:
- clauseType (string): e.g. "Limitation of liability", "Auto-renewal", "Governing law", "Confidentiality", etc.
- originalText (string): The exact text from the contract for this clause.
- plainEnglish (string): 1 sentence explanation.
- riskScore (integer 1-10): Risk score.
- pageNumber (integer): The specific page number where this clause text appears in the PDF document. Look at the document carefully and identify the page. If you cannot determine the exact page, provide your best estimate based on the clause sequence.
- recommendation (string): Short advice on how to negotiate or mitigate this clause.
- negotiationLanguage (string): Suggested replacement text if risk is 7 or higher.
- isPlaybookViolation (boolean): True if clause violates the playbook rules or bespoke constraints.

Overall:
- overallRisk (integer 1-10): Overall risk score.
- riskLabel (string): 'low', 'medium', or 'high'.
- summary (string): 3 sentences maximum.
- autoRenewalDate (string): Explicit auto-renewal date in YYYY-MM-DD format if explicitly stated in the contract, otherwise empty string "".
- expirationDate (string): Explicit expiration date in YYYY-MM-DD format if explicitly stated in the contract, otherwise empty string "".

CRITICAL: If a specific expiration or renewal date is NOT explicitly typed in the contract text, you MUST return an empty string "" for the date fields. Do not calculate, assume, or fabricate dates under any circumstances. DO NOT hallucinate.`
}

export async function POST(req: Request) {
  let parsedContractId = null
  try {
    const supabase = getSupabaseStorage()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractId, perspective, playbookRules, bespokeConstraints, contractType } = await req.json()
    parsedContractId = contractId
    if (!contractId) return NextResponse.json({ message: 'Missing contractId' }, { status: 400 })

    const canAnalyze = await checkUsageLimit(user.id)
    if (!canAnalyze) {
      return NextResponse.json({ message: 'Usage limit reached. Please upgrade your plan.' }, { status: 429 })
    }

    // Format playbook rules if provided as list or fetch user playbook as fallback
    let hasPlaybookRules = true
    let formattedPlaybookRules = ''
    if (playbookRules && Array.isArray(playbookRules)) {
      if (playbookRules.length > 0) {
        formattedPlaybookRules = playbookRules.map((r, i) => `${i + 1}. ${r}`).join('\n')
      } else {
        hasPlaybookRules = false
        formattedPlaybookRules = 'No specific rules.'
      }
    } else if (playbookRules && typeof playbookRules === 'string') {
      if (playbookRules.trim().length > 0) {
        formattedPlaybookRules = playbookRules
      } else {
        hasPlaybookRules = false
        formattedPlaybookRules = 'No specific rules.'
      }
    } else {
      const playbookRecords = await db.select().from(userPlaybook).where(eq(userPlaybook.userId, user.id))
      if (playbookRecords.length === 0) {
        hasPlaybookRules = false
        formattedPlaybookRules = 'No specific rules.'
      } else {
        formattedPlaybookRules = playbookRecords.map((r, i) => `${i + 1}. ${r.ruleText}`).join('\n')
      }
    }

    const formattedBespokeConstraints = bespokeConstraints && typeof bespokeConstraints === 'string' && bespokeConstraints.trim().length > 0
      ? bespokeConstraints
      : 'No bespoke deal constraints provided.'

    let userPerspective = perspective || 'Neutral'
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId))
    if (!contract) throw new Error('Contract not found')

    if (contract.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // GIGO Trapdoor: If it's classified as invalid, abort immediately, mark status as error, and return 400
    if (contractType === 'invalid' || contract.contractType === 'invalid') {
      await db.update(contracts).set({
        status: 'error',
        summary: 'invalid_document',
      }).where(eq(contracts.id, contractId))

      return NextResponse.json(
        { error: 'invalid_document', message: 'This document does not appear to be a B2B contract.' },
        { status: 400 }
      )
    }

    // Set status to analyzing and update contractType if provided
    const updateFields: any = { status: 'analyzing' }
    if (contractType) {
      updateFields.contractType = contractType
    }
    await db.update(contracts).set(updateFields).where(eq(contracts.id, contractId))

    const activeContractType = contractType || contract.contractType
    if (activeContractType === 'oem_supply') {
      userPerspective = 'Supplier'
    }
    let systemInstruction = buildSystemInstruction(userPerspective, formattedPlaybookRules, formattedBespokeConstraints)
    if (!hasPlaybookRules) {
      systemInstruction += `\n\nCRITICAL: The user has NO playbook rules. You MUST set \`isPlaybookViolation: false\` for EVERY clause. Do not flag any playbook violations under any circumstances.`
    }

    if (activeContractType === 'oem_supply') {
      systemInstruction += `\n\nCRITICAL AUTO OEM RISKS TO FLAG: 1. Line-Stoppage Indemnity (holding supplier liable for OEM downtime). 2. Tooling & Die IP Ownership (OEM claiming ownership of unpaid molds). 3. Unilateral Rolling Forecasts (forcing inventory holds without purchase guarantees).\n\nREDLINING DIRECTIVE: For the \`negotiationLanguage\` output, you must draft aggressive, Tier-1 standard counter-clauses. Limit indemnities to direct damages, explicitly reject consequential line-down charges, and mandate that tooling IP transfers only upon 100% payment clearance.`
    }

    let parsedResponse: any = null

    try {
      // Download file buffer from Supabase Storage
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { data, error } = await supabase.storage.from('contracts').download(contract.filePath)
        if (error || !data) throw new Error('Failed to download contract from storage or buffer is empty.')
        const arrayBuffer = await data.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log('--- BUFFER CHECK ---', { byteLength: buffer.byteLength })

        if (buffer.byteLength === 0) {
          throw new Error('Failed to download contract from storage or buffer is empty.')
        }

        const filename = contract.name.toLowerCase()

        if (filename.endsWith('.pdf')) {
          let textContent = ''
          let pageCount = 1
          try {
            const result = await pdf(buffer)
            textContent = result.text || ''
            pageCount = result.numpages || 1
          } catch (pdfErr) {
            console.warn('pdf-parse failed in analyze route, falling back to base64 inlineData upload:', pdfErr)
          }

          const minTextLength = Math.max(1000, pageCount * 150)
          if (textContent.trim().length > minTextLength) {
            console.log('--- PDF TEXT EXTRACTED SUCCESSFULLY, sending to Gemini ---', textContent.substring(0, 100))
            const result = await retryWithBackoff(() => ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                systemInstruction + "\n\nContract text:\n" + textContent,
              ],
              config: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA,
              },
            }))
            if (!result.text) throw new Error('Gemini returned empty response')
            parsedResponse = JSON.parse(result.text)
          } else {
            console.log('--- FALLING BACK TO DIRECT PDF BASE64 UPLOAD TO GEMINI ---')
            const base64Data = Buffer.from(buffer).toString('base64')
            const result = await retryWithBackoff(() => ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                { inlineData: { data: base64Data, mimeType: 'application/pdf' } },
                systemInstruction,
              ],
              config: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA,
              },
            }))
            if (!result.text) throw new Error('Gemini returned empty response')
            parsedResponse = JSON.parse(result.text)
          }
        } else if (filename.endsWith('.docx')) {
          const textResult = await mammoth.extractRawText({ buffer })
          const textContent = textResult.value

          console.log('--- DOCX EXTRACTED, sending to Gemini ---', textContent.substring(0, 100))

          const result = await retryWithBackoff(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              systemInstruction + "\n\nContract text:\n" + textContent,
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA,
            },
          }))

          if (!result.text) throw new Error('Gemini returned empty response')
          parsedResponse = JSON.parse(result.text)
        } else if (filename.endsWith('.txt')) {
          const textContent = buffer.toString('utf-8')
          const result = await retryWithBackoff(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              systemInstruction + "\n\nContract text:\n" + textContent,
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA,
            },
          }))

          if (!result.text) throw new Error('Gemini returned empty response')
          parsedResponse = JSON.parse(result.text)
        } else {
          throw new Error('Unsupported file format. Only PDF, DOCX, and TXT are supported.')
        }
      } else {
        throw new Error('Supabase URL not configured — cannot download file.')
      }
    } catch (geminiError: any) {
      console.error('Error during Gemini analysis:', {
        message: geminiError?.message,
        status: geminiError?.status,
        error: geminiError
      })
      const is503Or429 = geminiError.status === 503 || 
                         geminiError.code === 503 || 
                         geminiError.status === 429 || 
                         geminiError.code === 429 ||
                         (geminiError.message && (
                           geminiError.message.includes('503') || 
                           geminiError.message.includes('429') || 
                           geminiError.message.includes('UNAVAILABLE') ||
                           geminiError.message.includes('high demand')
                         ))
      if (is503Or429) {
        try {
          await db.update(contracts).set({ status: 'pending_capacity' }).where(eq(contracts.id, contractId))
        } catch (dbErr) {
          console.error('Failed to update contract status to pending_capacity:', dbErr)
        }
        return NextResponse.json({ error: 'capacity_exceeded', message: 'API overload', contractId }, { status: 503 })
      }
      throw geminiError // rethrow to let the outer catch block handle it (marking status as 'error')
    }

    if (!parsedResponse || !parsedResponse.clauses) {
      throw new Error('Gemini returned incomplete analysis. Missing clauses array.')
    }

    // Insert clauses — map flat schema to DB schema
    if (parsedResponse.clauses && parsedResponse.clauses.length > 0) {
      await db.insert(clauses).values(
        parsedResponse.clauses.map((c: any) => ({
          contractId,
          clauseType: c.clauseType,
          originalText: c.originalText,
          plainEnglish: c.plainEnglish,
          riskScore: c.riskScore,
          riskLabel: c.riskScore >= 7 ? 'high' : c.riskScore >= 4 ? 'medium' : 'low',
          negotiationTip: c.recommendation || '',
          negotiationLanguage: c.negotiationLanguage || null,
          isPlaybookViolation: hasPlaybookRules ? (c.isPlaybookViolation === true) : false,
          pageNumber: c.pageNumber || null,
        }))
      )
    }

    // Update contract with flat top-level fields
    await db.update(contracts).set({
      status: 'done',
      overallRisk: parsedResponse.overallRisk,
      riskLabel: parsedResponse.overallRisk >= 7 ? 'high' : parsedResponse.overallRisk >= 4 ? 'medium' : 'low',
      summary: parsedResponse.summary,
      analyzedAt: new Date()
    }).where(eq(contracts.id, contractId))

    // Insert contract dates if they are successfully extracted and not empty
    if (parsedResponse.autoRenewalDate && parsedResponse.autoRenewalDate.trim() !== "") {
      try {
        await db.insert(contractDates).values({
          contractId,
          dateType: 'Auto-renewal notice',
          dateValue: parsedResponse.autoRenewalDate,
          description: 'Auto-renewal notice deadline extracted from contract text.',
        })
      } catch (err) {
        console.error('Failed to insert autoRenewalDate milestone:', err)
      }
    }
    if (parsedResponse.expirationDate && parsedResponse.expirationDate.trim() !== "") {
      try {
        await db.insert(contractDates).values({
          contractId,
          dateType: 'Contract expiration',
          dateValue: parsedResponse.expirationDate,
          description: 'Contract expiration deadline extracted from contract text.',
        })
      } catch (err) {
        console.error('Failed to insert expirationDate milestone:', err)
      }
    }

    // Close the usage loop by incrementing the active user's cycle usage
    await db.update(profiles)
      .set({ contractsUsedThisCycle: sql`${profiles.contractsUsedThisCycle} + 1` })
      .where(eq(profiles.id, user.id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Analysis error:', error)
    if (parsedContractId) {
      try {
        await db.update(contracts).set({ status: 'error', summary: error.message }).where(eq(contracts.id, parsedContractId))
      } catch (dbErr) {
        console.error('Failed to update contract error status:', dbErr)
      }
    }
    return NextResponse.json({ error: true, message: error.message || 'Internal error' }, { status: 500 })
  }
}