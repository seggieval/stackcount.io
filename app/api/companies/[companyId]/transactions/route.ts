export const runtime = 'nodejs';

import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { title, amount, type, category, date, companyId } = body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date),
        userId: user!.id,
        companyId,
      }
    });

    return NextResponse.json(transaction);
  } catch (err) {
    console.error("Transaction create error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  const { searchParams } = new URL(req.url);

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const type = searchParams.get("type"); // income, expense, all
  const sort = searchParams.get("sort") || "latest"; // latest, oldest
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const where: any = { companyId };
  if (type && type !== "all") {
    where.type = type;
  }

  const orderBy = {
    date: sort === "latest" ? "desc" : "asc",
  } as const;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    data: transactions,
    total,
    page,
    pageSize,
  });
}


// PATCH (update a transaction)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { id, title, amount, category, date, type } = body;

  try {
    const updated = await prisma.transaction.update({
      where: { id },
      data: { title, amount: parseFloat(amount), category, date: new Date(date), type },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH error:", err);
    return new NextResponse("Update failed", { status: 500 });
  }
}

// DELETE (remove a transaction)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const ids: string[] = Array.isArray(body.ids) ? body.ids : (body.id ? [body.id] : []);

  if (!ids.length) return new NextResponse("Missing ids", { status: 400 });

  try {
    await prisma.transaction.deleteMany({
      where: { id: { in: ids } },
    });
    return new NextResponse("Deleted", { status: 200 });
  } catch (err) {
    console.error("DELETE error:", err);
    return new NextResponse("Delete failed", { status: 500 });
  }
}


