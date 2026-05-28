import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contracts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const [contract] = await db.select({
            filePath: contracts.filePath,
            name: contracts.name,
        }).from(contracts).where(eq(contracts.id, params.id))

        if (!contract) {
            return NextResponse.json({ error: true, message: 'Contract not found' }, { status: 404 })
        }

        // Download from Supabase Storage and stream back
        const { createServerClient } = await import('@supabase/ssr')
        const { cookies } = await import('next/headers')
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { },
                },
            }
        )

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