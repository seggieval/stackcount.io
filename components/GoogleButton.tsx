"use client"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"

export default function GoogleButton() {
  return (
    <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} variant="outline" className="w-full gap-2">
      <FcGoogle className="h-5 w-5" />
      Continue with Google
    </Button>
  )
}
