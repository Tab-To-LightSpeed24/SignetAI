import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

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

    // Check if profile exists; if not, auto-create it with metadata from Supabase
    let [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id))
    
    if (!profile) {
      try {
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
        const [newProfile] = await db.insert(profiles).values({
          id: user.id,
          fullName: fullName,
          plan: 'free',
          contractsUsedThisCycle: 0,
        }).returning()
        profile = newProfile
      } catch (err) {
        console.error('Failed to auto-create profile in API:', err)
      }
    }

    const plan = profile?.plan ?? 'free'
    const used = profile?.contractsUsedThisCycle ?? 0
    
    // Map plan to exact contract limits
    let limit = 3
    if (plan === 'starter') limit = 15
    else if (plan === 'growth') limit = 50
    else if (plan === 'premium') limit = 50
    else if (plan === 'unlimited') limit = -1

    const canAnalyze = limit === -1 ? true : used < limit

    return NextResponse.json({
      canAnalyze,
      used,
      limit,
      plan
    })
  } catch (error: any) {
    console.error('Usage check error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
