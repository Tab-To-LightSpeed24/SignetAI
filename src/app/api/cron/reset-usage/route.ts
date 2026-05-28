import { NextResponse } from 'next/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { lte, sql } from 'drizzle-orm'

export async function GET(_req: Request) {
  try {
    // Format today as YYYY-MM-DD for standard DATE comparison
    const todayStr = new Date().toISOString().split('T')[0]

    // Update profiles: reset contracts_used_this_cycle to 0 and push cycle_reset_date out by 1 month
    const result = await db.update(profiles)
      .set({
        contractsUsedThisCycle: 0,
        cycleResetDate: sql`cycle_reset_date + interval '1 month'`
      })
      .where(lte(profiles.cycleResetDate, todayStr))
      .returning({
        id: profiles.id,
        fullName: profiles.fullName,
        newResetDate: profiles.cycleResetDate
      })

    return NextResponse.json({
      success: true,
      message: `Successfully reset usage for ${result.length} profile(s).`,
      updatedProfiles: result
    })
  } catch (error: any) {
    console.error('Cron reset-usage error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error during usage reset.'
    }, { status: 500 })
  }
}
