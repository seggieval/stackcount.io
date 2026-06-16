// app/donate/thanks/page.tsx
import Stripe from "stripe"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Footer from "@/components/Footer"
import Header from "@/components/Header"

export const dynamic = "force-dynamic" // ensure fresh data after redirect

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function extractPiIdFromClientSecret(cs?: string | null) {
  // Accept forms like "pi_12345_secret_abcdef"
  if (!cs) return null
  if (cs.startsWith("pi_") && cs.includes("_secret_")) {
    return cs.split("_secret_")[0] // "pi_12345"
  }
  return null
}

function humanStatus(status: string) {
  switch (status) {
    case "succeeded":
      return { label: "Payment received — thank you for supporting stackCount.", ok: true }
    case "processing":
      return { label: "Payment is processing. This usually takes a few moments.", ok: false }
    case "requires_payment_method":
      return { label: "Payment failed. Please try another card or payment method.", ok: false }
    default:
      return { label: `${status.replace(/_/g, " ")} — we're looking into it.`, ok: false }
  }
}

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const piId =
    (typeof searchParams.payment_intent === "string" ? searchParams.payment_intent : null) ||
    extractPiIdFromClientSecret(
      typeof searchParams.payment_intent_client_secret === "string"
        ? searchParams.payment_intent_client_secret
        : null
    )

  let pi:
    | { id: string; amount: number; currency: string; status: string }
    | null = null
  let fetchError: string | null = null

  if (piId) {
    try {
      const got = await stripe.paymentIntents.retrieve(piId)
      pi = {
        id: got.id,
        amount: got.amount,
        currency: got.currency,
        status: got.status,
      }
    } catch (e: any) {
      fetchError = e?.message ?? "Unable to retrieve payment."
    }
  } else {
    fetchError = "Missing payment reference."
  }

  const info = pi
  const statusInfo = info ? humanStatus(info.status) : { label: "Confirming payment status…", ok: false }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="max-w-xl mx-auto py-20 px-4 text-center flex-1">
        <Card className="p-8">
          <div
            className={
              "mx-auto size-16 rounded-full grid place-items-center mb-4 " +
              (statusInfo.ok
                ? "bg-green-600/10 text-green-600"
                : "bg-amber-500/10 text-red-500")
            }
          >
            {statusInfo.ok ? "✓" : "✗"}
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {statusInfo.ok ? "Thank you for your support!" : "Donation unsuccessful"}
          </h1>
          <p className="text-muted-foreground mb-6">{statusInfo.label}</p>

          {info && (
            <div className="text-sm text-left mx-auto max-w-sm space-y-1">
              <div className="flex justify-between">
                <span>Amount</span>
                <span>
                  ${(info.amount / 100).toFixed(2)} {info.currency?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="uppercase">{info.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference</span>
                <span className="font-mono">{info.id}</span>
              </div>
            </div>
          )}

          {fetchError && (
            <p className="text-sm text-red-500 mt-4">Error: {fetchError}</p>
          )}

          <div className="mt-6 flex gap-2 justify-center">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/donate">{statusInfo.ok ? "Donate again" : "Try again"}</Link>
            </Button>
          </div>

          {statusInfo.ok ? (
            <p className="mt-6 text-xs text-muted-foreground">
              Your support helps cover hosting and OpenAI API costs. Thank you.
            </p>
          ) : null}
        </Card>
      </div>

      <Footer />
    </div>
  )
}
