import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { db } from '@/db'
import { contracts } from '@/db/schema'
import crypto from 'crypto'

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

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseStorage()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    let filePath = fileName

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = getSupabaseStorage()
      const { data, error } = await supabase.storage.from('contracts').upload(fileName, file)
      if (error) throw error
      filePath = data.path
    }

    // Insert into DB
    const [contract] = await db.insert(contracts).values({
      userId: user.id,
      name: file.name,
      filePath,
      fileHash: hash,
      status: 'pending'
    }).returning()

    return NextResponse.json({ success: true, contractId: contract.id })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
