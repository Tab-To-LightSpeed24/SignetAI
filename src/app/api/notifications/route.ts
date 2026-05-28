import { NextResponse } from 'next/server'
import { db } from '@/db'
import { contractDates, contracts } from '@/db/schema'
import { eq, sql, and } from 'drizzle-orm'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch upcoming deadlines (e.g., within next 90 days, reminderSent = false)
    const deadlines = await db
      .select({
        id: contractDates.id,
        dateType: contractDates.dateType,
        dateValue: contractDates.dateValue,
        contractName: contracts.name,
      })
      .from(contractDates)
      .innerJoin(contracts, eq(contractDates.contractId, contracts.id))
      .where(
        and(
          eq(contracts.userId, userId),
          eq(contractDates.reminderSent, false),
          sql`${contractDates.dateValue}::date <= (CURRENT_DATE + interval '90 days')`
        )
      )
      .orderBy(contractDates.dateValue)
      .limit(5)

    const notifications = deadlines.map((d, index) => ({
      id: d.id,
      text: `${d.dateType} approaching for ${d.contractName} on ${d.dateValue}`,
      type: 'warning',
      unread: index === 0, // Mark first as unread as an example
    }))

    return NextResponse.json(notifications)
  } catch (err: any) {
    console.error('Notifications fetch error:', err)
    return NextResponse.json([], { status: 500 })
  }
}
