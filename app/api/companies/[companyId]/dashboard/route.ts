import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const transactions = await prisma.transaction.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: parseInt(limit) } : {}), // only apply "take" if limit is passed
  });

  return NextResponse.json(transactions);
}