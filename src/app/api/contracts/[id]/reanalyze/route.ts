import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { POST as AnalyzePOST } from '@/app/api/analyze/route'

export const maxDuration = 60

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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseStorage()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contractId = params.id
    if (!contractId) {
      return NextResponse.json({ message: 'Missing contract ID' }, { status: 400 })
    }

    const [contract] = await db.select().from(contracts).where(eq(contracts.id, contractId))
    if (!contract || contract.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden or Not found' }, { status: 403 })
    }

    if (!contract.filePath) {
      return NextResponse.json({ error: 'File path missing' }, { status: 400 })
    }

    // Call the original Analyze POST
    const fakeBody = JSON.stringify({
      contractId: contract.id,
      contractType: contract.contractType || 'global',
    })
    
    const fakeReq = new Request(req.url, {
      method: 'POST',
      headers: req.headers, // propagate cookies for auth
      body: fakeBody
    })

    return await AnalyzePOST(fakeReq)
  } catch (error: any) {
    console.error('Re-analyze error:', error)
    return NextResponse.json({ error: true, message: error.message }, { status: 500 })
  }
}
