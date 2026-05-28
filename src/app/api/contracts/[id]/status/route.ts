import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getSupabaseAuth() {
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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAuth()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 })
    }

    const [contract] = await db
      .select({ status: contracts.status, summary: contracts.summary })
      .from(contracts)
      .where(and(eq(contracts.id, params.id), eq(contracts.userId, user.id)))

    if (!contract) {
      return NextResponse.json({ error: true, message: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json({ status: contract.status, summary: contract.summary })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message || 'Internal error' }, { status: 500 })
  }
}
