import { NextResponse } from 'next/server'
import { db } from '@/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const testUserId = '094e7049-1bd5-4400-8423-6509bb6287d8'

        await db.execute(
            sql`INSERT INTO profiles (id, full_name, company_name, plan, contracts_used_this_cycle)
            VALUES (${testUserId}, 'Kaushik Sandbox', 'Test Corp', 'free', 0)
          ON CONFLICT (id) DO NOTHING`
        )

        return NextResponse.json({
            success: true,
            message: `Test user ${testUserId} seeded successfully.`,
        })
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
}
