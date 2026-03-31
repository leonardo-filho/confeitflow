import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const pedido = await prisma.pedido.findUnique({
    where: { id, userId: session.user.id },
    include: {
      cliente: true,
      itens: { include: { produto: true } },
      historico: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!pedido) {
    return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  return Response.json(pedido)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.pedido.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const pedido = await prisma.pedido.update({
    where: { id },
    data: body,
  })

  return Response.json(pedido)
}
