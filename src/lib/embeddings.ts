import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

/**
 * Generates a 768-dimensional embedding vector for the given text using
 * Google's gemini-embedding-2 model via the @google/genai SDK.
 *
 * @param text - The input text to embed.
 * @returns A float array of length 768 suitable for pgvector storage.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  })

  const values = result.embeddings?.[0]?.values
  if (!values || values.length === 0) {
    throw new Error('gemini-embedding-2 returned an empty embedding vector')
  }

  return values
}
