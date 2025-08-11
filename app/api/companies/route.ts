export const runtime = 'nodejs';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { companies: true },
  });

  return NextResponse.json(user?.companies || []);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { name } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return new NextResponse("User not found", { status: 404 });

  // 🔐 Check if this user already has a company with that name
  const existing = await prisma.company.findFirst({
    where: {
      name,
      userId: user.id,
    },
  });

  if (existing) return new NextResponse("Company already exists", { status: 400 });

  const newCompany = await prisma.company.create({
    data: {
      name,
      userId: user.id,
    },
  });

  return NextResponse.json(newCompany);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return new NextResponse("User not found", { status: 404 });

  // 🔐 Check if the company belongs to the user
  const company = await prisma.company.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!company) return new NextResponse("Company not found", { status: 404 });

  await prisma.company.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Company deleted successfully" });
}