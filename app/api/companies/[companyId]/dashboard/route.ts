export const runtime = 'nodejs';

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompanyAccess } from "@/lib/require-company-access";

export async function GET(  
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const access = await requireCompanyAccess(companyId);
  if ("error" in access) {
    return new NextResponse(access.error, { status: access.status });
  }

  const transactions = await prisma.transaction.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: parseInt(limit) } : {}), // only apply "take" if limit is passed
  });

  return NextResponse.json(transactions);
}