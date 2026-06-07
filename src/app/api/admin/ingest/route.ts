import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateEmbedding } from '@/lib/embeddings'

/**
 * Admin-only POST route to ingest a legal knowledge entry into the
 * `legal_knowledge_base` table (pgvector). Protected by CRON_SECRET so it
 * is never publicly accessible.
 *
 * Body: { industry: string, rule_type: string, content: string }
 *
 * Prerequisites (run once in Supabase SQL editor):
 * -------------------------------------------------
 * CREATE EXTENSION IF NOT EXISTS vector;
 *
 * CREATE TABLE legal_knowledge_base (
 *   id          bigserial PRIMARY KEY,
 *   industry    text,
 *   rule_type   text,
 *   content     text NOT NULL,
 *   embedding   vector(768),
 *   created_at  timestamptz DEFAULT now()
 * );
 *
 * CREATE OR REPLACE FUNCTION match_legal_knowledge(
 *   query_embedding vector(768),
 *   match_threshold float,
 *   match_count     int
 * )
 * RETURNS TABLE (id bigint, industry text, rule_type text, content text, similarity float)
 * LANGUAGE sql STABLE AS $$
 *   SELECT id, industry, rule_type, content,
 *          1 - (embedding <=> query_embedding) AS similarity
 *   FROM legal_knowledge_base
 *   WHERE 1 - (embedding <=> query_embedding) > match_threshold
 *   ORDER BY embedding <=> query_embedding
 *   LIMIT match_count;
 * $$;
 *
 * Also add SUPABASE_SERVICE_ROLE_KEY to .env.local (from Supabase dashboard → Settings → API).
 */

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. ' +
      'Add SUPABASE_SERVICE_ROLE_KEY to your .env.local from the Supabase Dashboard → Settings → API.'
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

export async function POST(req: Request) {
  try {
    // Gate: only allow calls that supply the shared CRON_SECRET as a Bearer token.
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token || token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { industry, rule_type, content } = body as {
      industry?: string
      rule_type?: string
      content?: string
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      )
    }

    // Generate 768-dim vector from the rule content
    const embedding = await generateEmbedding(content)

    // Insert using the service-role client so RLS is bypassed
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('legal_knowledge_base')
      .insert({ industry: industry ?? null, rule_type: rule_type ?? null, content, embedding })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to insert into legal_knowledge_base:', error)
      return NextResponse.json(
        { error: 'Database insert failed', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err: any) {
    console.error('Admin ingest error:', err)
    return NextResponse.json(
      { error: 'Internal error', message: err.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
