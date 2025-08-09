import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { companies: true },
  });

  const defaultCompany = user?.companies[0];

  if (!defaultCompany) {
    return redirect("/companies");
  }

  return redirect(`/companies/${defaultCompany.id}/dashboard`);
}
