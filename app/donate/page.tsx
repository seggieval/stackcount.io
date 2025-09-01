"use client"

import React, { useEffect, useMemo, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
  ExpressCheckoutElement,
} from "@stripe/react-stripe-js"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Footer from "@/components/Footer"
import Header from "@/components/Header"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

/** Child inside <Elements> — safe to use useStripe/useElements here */
function PaymentUI({
  amount,
  clientSecret,
}: {
  amount: number
  clientSecret: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)

    // submit Elements (validation, wallet prep)
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setSubmitting(false)
      return
    }

    // confirm payment
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/donate/thanks`,
      },
    })
    if (error) {
      alert(error.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <ExpressCheckoutElement
        onConfirm={async (event) => {
          const s = event?.stripe
          if (!s) return

          const { error: submitError } = await event.elements.submit()
          if (submitError) {
            event.complete("fail")
            return
          }

          const { error } = await s.confirmPayment({
            elements: event.elements,
            clientSecret,
            confirmParams: { return_url: `${window.location.origin}/donate/thanks` },
          })
          event.complete(error ? "fail" : "success")
        }}
      />

      <form onSubmit={onSubmit} className="space-y-4">
        <PaymentElement options={{ layout: "tabs" }} />
        <Button type="submit" disabled={!stripe || submitting} className="w-full">
          {submitting
            ? "Processing…"
            : `Donate $${(amount / 100).toFixed(0)} (instant karma)`}
        </Button>
      </form>
    </div>
  )
}

/** Shell that fetches clientSecret and wraps children with <Elements> */
export default function Page() {
  const [amount, setAmount] = useState<number>(2000) // cents
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

  const options = useMemo(
    () => ({
      clientSecret: clientSecret ?? undefined,
    }),
    [clientSecret]
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="max-w-xl w-full mx-auto py-16 px-4 flex-1">
        <h1 className="text-3xl font-bold mb-2">Invest in my... whatever</h1>
        <p className="text-muted-foreground mb-6">
          Free app, zero paywalls. Donations fuel caffeine, server bills, and my bold plan to land a CS internship.
        </p>

        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Quick amounts</span>
            <div className="ml-auto flex gap-2">
              {[5, 10, 20, 50].map((v) => (
                <Button
                  key={v}
                  variant={amount === v * 100 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(v * 100)}
                >
                  ${v}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Custom (flex on me)</span>
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
          <div className="mt-6 text-sm text-muted-foreground">
            Summoning Stripe gremlins…
          </div>
        ) : (
          <Elements stripe={stripePromise} options={options}>
            <PaymentUI amount={amount} clientSecret={clientSecret} />
          </Elements>
        )}
      </div>

      <Footer />
    </div>
  )
}
