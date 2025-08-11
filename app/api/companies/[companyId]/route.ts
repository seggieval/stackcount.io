export const runtime = 'nodejs';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: { companyId: string } }) {
  const { companyId } = context.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      user: { email: session.user.email },
    },
  });

  if (!company) return new NextResponse("Not Found", { status: 404 });
  return NextResponse.json(company);
}
