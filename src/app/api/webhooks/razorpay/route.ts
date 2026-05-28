import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 400 })
    }

    // Cryptographic HMAC SHA256 verification
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('Razorpay webhook signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Signature verified — parse the payload
    const event = JSON.parse(rawBody)
    const eventType = event.event

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity
      if (!paymentEntity) {
        console.error('Webhook payload missing payment entity')
        return NextResponse.json({ error: 'Malformed payload' }, { status: 400 })
      }

      const userId = paymentEntity.notes?.userId
      const planType = paymentEntity.notes?.planType

      if (!userId || !planType) {
        console.error('Webhook notes missing userId or planType', paymentEntity.notes)
        return NextResponse.json({ error: 'Missing notes metadata' }, { status: 400 })
      }

      // Upgrade the user's plan and reset their usage counter
      await db.update(profiles)
        .set({
          plan: planType,
          contractsUsedThisCycle: 0,
        })
        .where(eq(profiles.id, userId))

      console.log(`[Razorpay Webhook] User ${userId} upgraded to "${planType}" plan.`)
      return NextResponse.json({ success: true })
    }

    // Acknowledge unhandled event types gracefully
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Razorpay webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
