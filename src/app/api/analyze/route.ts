import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts, clauses, profiles, userPlaybook, contractDates } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import mammoth from 'mammoth'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { checkUsageLimit } from '@/lib/usage'
import { generateEmbedding } from '@/lib/embeddings'

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

/**
 * Service-role Supabase client — bypasses RLS for trusted server operations
 * such as querying the legal_knowledge_base via the match_legal_knowledge RPC.
 * Falls back gracefully if SUPABASE_SERVICE_ROLE_KEY is not yet configured.
 */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

/**
 * Fetches the top-3 most relevant legal benchmarks for the given text snippet
 * from the pgvector legal_knowledge_base table. Returns a formatted string
 * ready to be injected into the system prompt, or an empty string on failure.
 */
async function fetchRAGContext(textSnippet: string): Promise<string> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) return ''

    const queryEmbedding = await generateEmbedding(textSnippet)
    const { data: matchedRules, error } = await supabaseAdmin.rpc('match_legal_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 3,
    })

    if (error || !matchedRules || matchedRules.length === 0) return ''

    const retrievedContextString = (matchedRules as Array<{ industry?: string; rule_type?: string; content: string }>)
      .map((r, i) => `${i + 1}. [${r.industry ?? 'General'} / ${r.rule_type ?? 'Rule'}]: ${r.content}`)
      .join('\n')

    return `\n\n### RETRIEVED LEGAL BENCHMARKS\nUse the following real-world industry benchmarks to accurately score the severity of clauses in this contract:\n${retrievedContextString}`
  } catch (ragErr) {
    // RAG enrichment is best-effort — never let it break the core analysis pipeline
    console.warn('RAG context fetch failed (non-fatal):', (ragErr as Error).message)
    return ''
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

// Safety cap: hard-enforce a 50k char limit to reduce token payload and lower the risk of
// Google free-tier dropping the connection. A console.warn fires whenever a document is cut.
const MAX_CONTRACT_CHARS = 50_000

// Max wall-time budget for retries: 1500ms + 3000ms = 4500ms of sleep across 2 retries.
// This keeps the total pipeline well under Vercel's 60-second execution ceiling.
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1500,
  backoffFactor = 2.0
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
      // Final retry exhausted — surface a structured 503 so the outer catch can return cleanly
      // rather than letting the function hang until Vercel kills it with a 504.
      if (is503) {
        const capacityError: any = new Error('Gemini capacity exceeded after all retries')
        capacityError.isCapacityError = true
        throw capacityError
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
    overallRisk: { type: "INTEGER" as const, description: "Legacy 1-10 risk score for backward compat" },
    overallRiskScore: { type: "INTEGER" as const, description: "Aggregate risk score 0-100 per scoring engine rules" },
    riskLabel: { type: "STRING" as const, description: "One of: Low, Medium, High, Critical" },
    summary: { type: "STRING" as const },
    autoRenewalTerm: { type: "STRING" as const },
    expirationTerm: { type: "STRING" as const },
    requiresLawyerReview: { type: "BOOLEAN" as const },
    lawyerReferralReasoning: { type: "STRING" as const },
  },
  required: ["clauses", "overallRisk", "overallRiskScore", "riskLabel", "summary", "requiresLawyerReview", "lawyerReferralReasoning"],
}

function buildSystemInstruction(perspective: string, playbookRules: string, bespokeConstraints: string, ragBenchmarks: string = ''): string {
  const userPerspective = perspective || 'Neutral'
  return `You are an elite, ruthless corporate lawyer representing the ${userPerspective}. You are exclusively representing the interests of the ${userPerspective}. Ignore risks that only negatively impact the counterparty. Your sole objective is to protect the ${userPerspective} from liability and financial exposure.

SCORING ANCHOR: Do not rate everything as a High Risk. Reserve scores of 8-10 EXCLUSIVELY for existential, company-killing threats (e.g., unlimited liability, catastrophic penalties, IP forfeiture). Standard unfavorable commercial terms should be scored 4-6. Only truly dangerous clauses warrant a 7.

CRITICAL INSTRUCTION: You must analyze this contract strictly from the perspective of the ${userPerspective}.
Identify the top 5 to 7 most dangerous clauses that pose a liability, financial threat, or operational risk SPECIFICALLY to the ${userPerspective}.

If a clause heavily benefits the ${userPerspective}, DO NOT flag it as a risk.

If the perspective is 'Neutral', flag risks for both sides equally.

Extract any explicit relative timelines, durations, or hard dates for delivery, expiration, or renewals.

CRITICAL INSTRUCTIONS: 
1. If a clause scores 7 or higher, you MUST generate formal, business-friendly replacement contract language in the negotiationLanguage field, along with a 1-sentence business justification for the change in the recommendation field. 

User's Playbook Non-Negotiables:
${playbookRules}

Bespoke Deal Constraints / Raw Parameters:
${bespokeConstraints}

CRITICAL: If any clause violates the Playbook Non-Negotiables or contradicts the Bespoke Deal Constraints, you MUST flag it. Set isPlaybookViolation to true for that clause in the JSON response. Otherwise, set it to false.

For each clause, provide:
- clauseType (string): e.g. "Limitation of liability", "Auto-renewal", "Governing law", "Confidentiality", "Termination for Convenience", "Indemnification", "Payment Terms", etc.
- originalText (string): The exact text from the contract for this clause.
- plainEnglish (string): 1 sentence explanation.
- riskScore (integer 1-10): Risk score.
- pageNumber (integer): The specific page number where this clause text appears in the PDF document. Look at the document carefully and identify the page. If you cannot determine the exact page, provide your best estimate based on the clause sequence.
- recommendation (string): Short advice on how to negotiate or mitigate this clause.
- negotiationLanguage (string): Suggested replacement text if risk is 7 or higher.
- isPlaybookViolation (boolean): True if clause violates the playbook rules or bespoke constraints.

Overall:
- overallRisk (integer 1-10): Overall risk score.
- riskLabel (string): 'Low', 'Medium', 'High', or 'Critical'.
- summary (string): 3 sentences maximum.
- autoRenewalTerm (string): The explicit auto-renewal period or date (e.g., "1 year", "30 days notice", or "YYYY-MM-DD"). Empty string "" if not stated.
- expirationTerm (string): The explicit duration, delivery schedule, or expiration date (e.g., "30 months from NOA", "18 months from commissioning", or "YYYY-MM-DD"). Empty string "" if not stated.

### OVERALL RISK SCORING & REFERRAL ENGINE
After extracting and scoring individual clauses, calculate the 'overallRiskScore' (0-100) and 'riskLabel' for the entire contract using these rules:
1. QUANTITY OF RISK: Start with a baseline score of 0. Add 10 points for every clause scored as "High" risk (riskScore >= 7), and 3 points for every "Medium" risk (riskScore 4-6). Cap at 100.
2. CONTEXTUAL MULTIPLIERS (Existential Threats): Immediately elevate the overall score to 85+ (Critical) if you detect any of the following threats to an industrial SME:
   - Unlimited liability or indemnity without financial caps.
   - Unilateral price modification rights by the buyer.
   - IP ownership transfer of the SME's background technology.
   - Auto-renewal traps with less than 30 days opt-out notice.
3. RISK LABELS: 0-30 = Low, 31-69 = Medium, 70-84 = High, 85-100 = Critical.
4. Also output the legacy 'overallRisk' field as an integer from 1-10 (overallRiskScore / 10, rounded) for backward compatibility.

### LAWYER REFERRAL TRIGGER ('requiresLawyerReview')
Set requiresLawyerReview to TRUE if AND ONLY IF:
- The overallRiskScore is >= 75.
- OR the contract contains complex jurisdictional disputes outside of India.
- OR the financial damage potential of a single flagged clause could bankrupt an SME (e.g., massive OEM delay penalties, unlimited indemnity exposure).
If TRUE, write a concise, urgent 'lawyerReferralReasoning' (2-3 sentences) explaining exactly which clause makes this too dangerous to sign without a legal expert, addressed directly to an SME owner. If FALSE, set lawyerReferralReasoning to an empty string "".${ragBenchmarks ? `\n\n${ragBenchmarks}` : ''}`
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
      try {
        const playbookRecords = await db.select().from(userPlaybook).where(eq(userPlaybook.userId, user.id))
        if (playbookRecords.length === 0) {
          hasPlaybookRules = false
          formattedPlaybookRules = 'No specific rules.'
        } else {
          formattedPlaybookRules = playbookRecords.map((r, i) => `${i + 1}. ${r.ruleText}`).join('\n')
        }
      } catch (playbookErr) {
        console.error('Failed to fetch user playbook from DB — defaulting to no rules:', playbookErr)
        hasPlaybookRules = false
        formattedPlaybookRules = 'No specific rules.'
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
    let systemInstruction = buildSystemInstruction(userPerspective, formattedPlaybookRules, formattedBespokeConstraints, '')
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
            const pdf = (await import('pdf-parse')).default
            const result = await pdf(buffer)
            textContent = result.text || ''
            pageCount = result.numpages || 1
          } catch (pdfErr) {
            console.warn('pdf-parse failed in analyze route, falling back to base64 inlineData upload:', pdfErr)
          }

          const minTextLength = Math.max(1000, pageCount * 150)
          if (textContent.trim().length > minTextLength) {
            let safeTextContent = textContent
            if (textContent.length > MAX_CONTRACT_CHARS) {
              console.warn('--- CONTRACT TRUNCATED TO 50K CHARACTERS FOR SAFETY ---')
              safeTextContent = textContent.substring(0, MAX_CONTRACT_CHARS) + '\n\n[CONTRACT TRUNCATED FOR PROCESSING — analyze only the text provided above]'
            }
            // RAG enrichment: embed first 1500 chars and fetch relevant legal benchmarks
            const ragContext = await fetchRAGContext(safeTextContent.substring(0, 1500))
            const enrichedInstruction = systemInstruction + ragContext
            console.log('--- PDF TEXT EXTRACTED SUCCESSFULLY, sending to Gemini ---', safeTextContent.substring(0, 100))
            const result = await retryWithBackoff(() => ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                enrichedInstruction + "\n\nContract text:\n" + safeTextContent,
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
            // RAG enrichment: use filename + first 500 chars of base64 as proxy snippet since raw text is unavailable
            const ragContextBase64 = await fetchRAGContext(contract.name + ' ' + Buffer.from(buffer).toString('utf-8', 0, 500))
            const enrichedInstructionBase64 = systemInstruction + ragContextBase64
            const result = await retryWithBackoff(() => ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                { inlineData: { data: base64Data, mimeType: 'application/pdf' } },
                enrichedInstructionBase64,
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
          const rawDocxText = textResult.value
          let textContent = rawDocxText
          if (rawDocxText.length > MAX_CONTRACT_CHARS) {
            console.warn('--- CONTRACT TRUNCATED TO 50K CHARACTERS FOR SAFETY ---')
            textContent = rawDocxText.substring(0, MAX_CONTRACT_CHARS) + '\n\n[CONTRACT TRUNCATED FOR PROCESSING — analyze only the text provided above]'
          }

          // RAG enrichment: embed first 1500 chars and fetch relevant legal benchmarks
          const ragContextDocx = await fetchRAGContext(textContent.substring(0, 1500))
          const enrichedInstructionDocx = systemInstruction + ragContextDocx
          console.log('--- DOCX EXTRACTED, sending to Gemini ---', textContent.substring(0, 100))

          const result = await retryWithBackoff(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              enrichedInstructionDocx + "\n\nContract text:\n" + textContent,
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA,
            },
          }))

          if (!result.text) throw new Error('Gemini returned empty response')
          parsedResponse = JSON.parse(result.text)
        } else if (filename.endsWith('.txt')) {
          const rawTxtText = buffer.toString('utf-8')
          let textContent = rawTxtText
          if (rawTxtText.length > MAX_CONTRACT_CHARS) {
            console.warn('--- CONTRACT TRUNCATED TO 50K CHARACTERS FOR SAFETY ---')
            textContent = rawTxtText.substring(0, MAX_CONTRACT_CHARS) + '\n\n[CONTRACT TRUNCATED FOR PROCESSING — analyze only the text provided above]'
          }
          // RAG enrichment for TXT
          const ragContextTxt = await fetchRAGContext(textContent.substring(0, 1500))
          const enrichedInstructionTxt = systemInstruction + ragContextTxt
          const result = await retryWithBackoff(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              enrichedInstructionTxt + "\n\nContract text:\n" + textContent,
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
      const is503Or429 = geminiError.isCapacityError === true ||
                         geminiError.status === 503 ||
                         geminiError.code === 503 ||
                         geminiError.status === 429 ||
                         geminiError.code === 429 ||
                         (geminiError.message && (
                           geminiError.message.includes('503') ||
                           geminiError.message.includes('429') ||
                           geminiError.message.includes('UNAVAILABLE') ||
                           geminiError.message.includes('high demand') ||
                           geminiError.message.includes('capacity exceeded')
                         ))
      if (is503Or429) {
        try {
          await db.update(contracts).set({ status: 'failed_capacity', riskLabel: 'Unavailable' }).where(eq(contracts.id, contractId))
        } catch (dbErr) {
          console.error('Failed to update contract status to failed_capacity:', dbErr)
        }
        return NextResponse.json({ error: 'capacity_exceeded', message: 'API overload — please retry in a moment.', contractId }, { status: 503 })
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
    // overallRiskScore is the new 0-100 engine score; fall back to scaling legacy overallRisk (1-10) if model didn't return it
    const computedOverallRiskScore = typeof parsedResponse.overallRiskScore === 'number'
      ? Math.min(100, Math.max(0, parsedResponse.overallRiskScore))
      : Math.min(100, Math.max(0, (parsedResponse.overallRisk ?? 0) * 10))

    // Derive the canonical riskLabel from the 0-100 score if model returned a well-known string
    const validRiskLabels = ['Low', 'Medium', 'High', 'Critical']
    const canonicalRiskLabel = validRiskLabels.includes(parsedResponse.riskLabel)
      ? parsedResponse.riskLabel
      : computedOverallRiskScore >= 85 ? 'Critical'
      : computedOverallRiskScore >= 70 ? 'High'
      : computedOverallRiskScore >= 31 ? 'Medium'
      : 'Low'

    await db.update(contracts).set({
      status: 'done',
      overallRisk: computedOverallRiskScore,
      riskLabel: canonicalRiskLabel,
      summary: parsedResponse.summary,
      requiresLawyerReview: parsedResponse.requiresLawyerReview === true,
      lawyerReferralReasoning: parsedResponse.requiresLawyerReview === true
        ? (parsedResponse.lawyerReferralReasoning || null)
        : null,
      analyzedAt: new Date()
    }).where(eq(contracts.id, contractId))

    // Insert contract dates if they are successfully extracted and not empty
    // autoRenewalTerm / expirationTerm now accept relative strings (e.g. "30 months from NOA")
    const autoRenewalTerm = parsedResponse.autoRenewalTerm || parsedResponse.autoRenewalDate || ''
    if (autoRenewalTerm.trim() !== '') {
      try {
        await db.insert(contractDates).values({
          contractId,
          dateType: 'Auto-renewal notice',
          dateValue: autoRenewalTerm,
          description: 'Auto-renewal term or deadline extracted from contract text.',
        })
      } catch (err) {
        console.error('Failed to insert autoRenewalTerm milestone:', err)
      }
    }
    const expirationTerm = parsedResponse.expirationTerm || parsedResponse.expirationDate || ''
    if (expirationTerm.trim() !== '') {
      try {
        await db.insert(contractDates).values({
          contractId,
          dateType: 'Contract expiration',
          dateValue: expirationTerm,
          description: 'Contract duration or expiration term extracted from contract text.',
        })
      } catch (err) {
        console.error('Failed to insert expirationTerm milestone:', err)
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