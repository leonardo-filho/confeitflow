import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.ingrediente.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return Response.json({ error: 'Ingrediente não encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { nome, unidade, estoqueAtual, estoqueMinimo } = body

  const ingrediente = await prisma.ingrediente.update({
    where: { id },
    data: {
      ...(nome !== undefined && { nome }),
      ...(unidade !== undefined && { unidade }),
      ...(estoqueAtual !== undefined && { estoqueAtual }),
      ...(estoqueMinimo !== undefined && { estoqueMinimo }),
    },
  })

  return Response.json(ingrediente)
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
  const existing = await prisma.ingrediente.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return Response.json({ error: 'Ingrediente não encontrado' }, { status: 404 })
  }

  await prisma.ingrediente.delete({ where: { id } })
  return Response.json({ ok: true })
}
