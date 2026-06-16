import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function requireCompanyAccess(companyId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { error: "Unauthorized", status: 401 as const }
  }

  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      user: { email: session.user.email },
    },
  })

  if (!company) {
    return { error: "Not Found", status: 404 as const }
  }

  return { session, company }
}
