import { NextResponse } from "next/server"
import Stripe from "stripe"


// Route handlers run on Node.js by default in Next.js 15.
export const runtime = "nodejs"
export const dynamic = "force-dynamic" // avoid static optimization


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 })


  const body = await req.text() // RAW body required for signature verification
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error("Webhook signature verification failed", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }


  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent
        // TODO: mark donation as paid in DB, send email, etc.
        console.log("✅ Payment succeeded:", pi.id, pi.amount, pi.currency)
        break
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        console.warn("❌ Payment failed:", pi.id)
        break
      }
      default:
        // console.log("Unhandled event", event.type)
        break
    }
    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Webhook handler error", err)
    return NextResponse.json({ error: "Handler failure" }, { status: 500 })
  }
}