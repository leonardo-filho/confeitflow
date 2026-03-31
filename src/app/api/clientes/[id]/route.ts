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
  const cliente = await prisma.cliente.findUnique({
    where: { id, userId: session.user.id },
    include: { pedidos: { orderBy: { createdAt: 'desc' } } },
  })

  if (!cliente) {
    return Response.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  return Response.json(cliente)
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
  const body = await request.json()

  const existing = await prisma.cliente.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return Response.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  const cliente = await prisma.cliente.update({
    where: { id },
    data: body,
  })

  return Response.json(cliente)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.cliente.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return Response.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  await prisma.cliente.delete({ where: { id } })
  return Response.json({ success: true })
}
