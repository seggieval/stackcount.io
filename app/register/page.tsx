import { RegisterForm } from "@/components/auth/register-form"
import Logo from "@/components/Logo"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")
  return (
    <div className="bg-whitetext flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <Logo />
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
