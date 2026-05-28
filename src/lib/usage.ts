import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function checkUsageLimit(userId: string): Promise<boolean> {
  let [profile] = await db.select().from(profiles).where(eq(profiles.id, userId))
  
  // Auto-provision a default profile row if it's missing
  if (!profile) {
    try {
      const [newProfile] = await db.insert(profiles).values({
        id: userId,
        plan: 'free',
        contractsUsedThisCycle: 0,
      }).returning()
      profile = newProfile
    } catch (err) {
      console.error('Failed to auto-create profile in checkUsageLimit:', err)
      return false
    }
  }

  if (profile.plan === 'unlimited') {
    return true;
  }

  let limit = 3;
  if (profile.plan === 'starter') limit = 15;
  else if (profile.plan === 'growth') limit = 50;
  else if (profile.plan === 'premium') limit = 50;

  return (profile.contractsUsedThisCycle ?? 0) < limit;
}
