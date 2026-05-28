import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkUsageLimit } from '@/lib/usage'

export const dynamic = 'force-dynamic'

function getSupabase() {
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

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canAnalyze = await checkUsageLimit(user.id)
    return NextResponse.json({ canAnalyze })
  } catch (error: any) {
    console.error('Usage check error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
