import { NextResponse } from 'next/server'
import { db } from '@/db'
import { newsletterSubscriptions } from '@/db/schema'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: true, message: 'Email is required' }, { status: 400 })
    }

    const [inserted] = await db
      .insert(newsletterSubscriptions)
      .values({
        email,
      })
      .returning()

    return NextResponse.json({ success: true, subscription: inserted })
  } catch (err: any) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
