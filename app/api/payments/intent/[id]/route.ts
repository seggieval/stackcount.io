import { NextResponse } from "next/server"
import Stripe from "stripe"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const pi = await stripe.paymentIntents.retrieve(params.id)
    return NextResponse.json({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      created: pi.created,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Not found" }, { status: 404 })
  }
}