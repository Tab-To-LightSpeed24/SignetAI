import { NextResponse } from 'next/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'dummy-secret-for-demo'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-signature') || ''

    // Rudimentary raw body signature validation (HMAC SHA256)
    // Replace this logic with your specific Merchant of Record provider's SDK (e.g. Stripe, Paddle)
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const eventType = payload.type || payload.event_type

    // Map webhook actions to database mutators
    if (eventType === 'subscription.created' || eventType === 'payment.successful') {
      const metadata = payload.data?.metadata || payload.metadata || {}
      const userId = metadata.userId || metadata.customer_id
      
      if (!userId) {
        return NextResponse.json({ error: 'No user identity provided in webhook metadata' }, { status: 400 })
      }

      await db.update(profiles).set({
        plan: 'premium',
        contractsUsedThisCycle: 0,
      }).where(eq(profiles.id, userId))

      console.log(`Successfully upgraded user ${userId} to premium via webhook.`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message || 'Webhook handler failed' }, { status: 400 })
  }
}
