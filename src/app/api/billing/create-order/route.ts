import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Razorpay from 'razorpay'

const PLAN_PRICES: Record<string, number> = {
  starter: 199900,   // ₹1,999 in paise
  growth: 499900,    // ₹4,999 in paise
}

function getSupabase() {
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
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType } = await req.json()

    if (!planType || !PLAN_PRICES[planType]) {
      return NextResponse.json({ error: 'Invalid plan type. Must be "starter" or "growth".' }, { status: 400 })
    }

    const amount = PLAN_PRICES[planType]

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      notes: {
        userId: user.id,
        planType,
      },
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
}
