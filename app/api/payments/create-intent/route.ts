import { NextResponse } from "next/server"
import Stripe from "stripe"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


export async function POST(req: Request) {
  try {
    const { amount, currency = "usd", metadata } = await req.json()


    if (!Number.isInteger(amount) || amount < 100 || amount > 1_000_000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }


    // Use Automatic Payment Methods so Stripe turns on eligible methods
    // (Apple Pay via Express Checkout, cards, Cash App Pay, etc.)
    const pi = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    })


    return NextResponse.json({ clientSecret: pi.client_secret })
  } catch (err: any) {
    console.error("/create-intent error", err)
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 })
  }
}