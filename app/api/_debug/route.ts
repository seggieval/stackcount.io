import { NextRequest } from 'next/server'
export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  return new Response(JSON.stringify({ ok: true, companyId: params.companyId }), { status: 200 })
}