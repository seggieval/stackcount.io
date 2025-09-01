"use client"


import React, { useEffect, useMemo, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useElements, useStripe, ExpressCheckoutElement } from "@stripe/react-stripe-js"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)


function DonateForm() {
  const stripe = useStripe()
  const elements = useElements()


  const [amount, setAmount] = useState<number>(2000) // cents
  const [submitting, setSubmitting] = useState(false)


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)


    // Always provide return_url (required for redirect methods like Cash App)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/donate/thanks` },
    })


    if (error) {
      alert(error.message)
      setSubmitting(false)
    }
    // If no error, the browser may redirect. If not, Stripe returns the PI status and we'll hit the thanks page.
  }


  // Create a new PI whenever amount changes
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  useEffect(() => {
    const run = async () => {
      setClientSecret(null)
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount, currency: "usd" }),
      })
      const data = await res.json()
      setClientSecret(data.clientSecret ?? null)
    }
    run()
  }, [amount])


  const options = useMemo(() => ({
    clientSecret: clientSecret ?? undefined,
    appearance: { theme: "night" as const },
  }), [clientSecret])


  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-2">Support the project</h1>
      <p className="text-muted-foreground mb-6">One-time donation. Apple Pay / Cash App / card supported.</p>


      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Amount (USD)</span>
          <div className="ml-auto flex gap-2">
            {[5, 10, 20, 50].map((v) => (
              <Button key={v} variant={amount === v * 100 ? "default" : "outline"} size="sm" onClick={() => setAmount(v * 100)}>
                ${v}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Custom</span>
          <Input
            type="number"
            min={1}
            placeholder="Enter amount in USD"
            onChange={(e) => {
              const dollars = Math.max(1, Math.floor(Number(e.target.value || 0)))
              setAmount(dollars * 100)
            }}
          />
        </div>
      </Card>


      {!clientSecret ? (
        <div className="mt-6 text-sm text-muted-foreground">Preparing secure payment…</div>
      ) : (
        <Elements stripe={stripePromise} options={options}>
          <div className="mt-6 space-y-4">
            {/* One‑click wallets (Apple Pay, Google Pay, Link, etc.) */}
            <ExpressCheckoutElement
              onConfirm={async (event) => {
                const stripe = event?.stripe ?? null
                if (!stripe) return
                const { error } = await stripe.confirmPayment({
                  elements: event.elements,
                  clientSecret: options.clientSecret!,
                  confirmParams: { return_url: `${window.location.origin}/donate/thanks` },
                })
                event.complete(error ? "fail" : "success")
              }}
            />


            {/* Full Payment Element (cards, Cash App, etc.) */}
            <form onSubmit={onSubmit} className="space-y-4">
              <PaymentElement options={{ layout: "tabs" }} />
              <Button type="submit" disabled={!stripe || submitting} className="w-full">
                {submitting ? "Processing…" : `Donate $${(amount / 100).toFixed(0)}`}
              </Button>
            </form>
          </div>
        </Elements>
      )}
    </div>
  )
}


export default function Page() {
  return <DonateForm />
}