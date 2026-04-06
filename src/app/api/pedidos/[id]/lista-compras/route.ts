import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

async function verifyPedido(pedidoId: string, userId: string) {
  return prisma.pedido.findUnique({
    where: { id: pedidoId, userId },
    select: { id: true },
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const pedido = await verifyPedido(id, session.user.id)
  if (!pedido) {
    return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  const itens = await prisma.itemListaCompras.findMany({
    where: { pedidoId: id },
    orderBy: [{ comprado: 'asc' }, { createdAt: 'asc' }],
  })

  return Response.json(itens)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const pedido = await verifyPedido(id, session.user.id)
  if (!pedido) {
    return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { nome, quantidade, unidade } = body

  if (!nome?.trim()) {
    return Response.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const item = await prisma.itemListaCompras.create({
    data: {
      nome: nome.trim(),
      quantidade: quantidade || 1,
      unidade: unidade?.trim() || 'un',
      pedidoId: id,
    },
  })

  return Response.json(item, { status: 201 })
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
  const pedido = await verifyPedido(id, session.user.id)
  if (!pedido) {
    return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { itemId, comprado } = body

  if (!itemId) {
    return Response.json({ error: 'itemId é obrigatório' }, { status: 400 })
  }

  const item = await prisma.itemListaCompras.update({
    where: { id: itemId, pedidoId: id },
    data: { comprado },
  })

  return Response.json(item)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const pedido = await verifyPedido(id, session.user.id)
  if (!pedido) {
    return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get('itemId')

  if (!itemId) {
    return Response.json({ error: 'itemId é obrigatório' }, { status: 400 })
  }

  await prisma.itemListaCompras.delete({
    where: { id: itemId, pedidoId: id },
  })

  return Response.json({ ok: true })
}
