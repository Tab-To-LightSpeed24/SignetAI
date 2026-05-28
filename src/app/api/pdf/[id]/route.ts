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

        const [contract] = await db.select({
            filePath: contracts.filePath,
            name: contracts.name,
        })
        .from(contracts)
        .where(and(eq(contracts.id, params.id), eq(contracts.userId, user.id)))

        if (!contract) {
            return NextResponse.json({ error: true, message: 'Contract not found' }, { status: 404 })
        }

        const { data, error } = await supabase.storage.from('contracts').download(contract.filePath)
        if (error || !data) {
            return NextResponse.json({ error: true, message: 'Failed to download file' }, { status: 500 })
        }

        const arrayBuffer = await data.arrayBuffer()

        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${contract.name}"`,
                'Content-Length': arrayBuffer.byteLength.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        })
    } catch (err: any) {
        return NextResponse.json({ error: true, message: err.message }, { status: 500 })
    }
}