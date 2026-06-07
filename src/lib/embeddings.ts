import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

/**
 * Generates a 768-dimensional embedding vector for the given text using
 * Google's text-embedding-005 model via the @google/genai SDK.
 *
 * @param text - The input text to embed.
 * @returns A float array of length 768 suitable for pgvector storage.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: 'text-embedding-005',
    contents: text,
  })

  const values = result.embeddings?.[0]?.values
  if (!values || values.length === 0) {
    throw new Error('text-embedding-005 returned an empty embedding vector')
  }

  return values
}
