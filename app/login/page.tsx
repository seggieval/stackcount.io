import { LoginForm } from "@/components/login-form"
import Logo from "@/components/Logo"

export default function LoginPage() {
  return (
    <div className="bg-whitetext flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <Logo />
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
}
