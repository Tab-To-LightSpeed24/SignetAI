import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function checkUsageLimit(userId: string): Promise<boolean> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId))
  
  if (!profile) {
    return false;
  }

  if (profile.plan === 'unlimited') {
    return true;
  }

  const limit = profile.plan === 'premium' ? 50 : 3;
  return (profile.contractsUsedThisCycle ?? 0) < limit;
}
