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
  const produto = await prisma.produto.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!produto) {
    return Response.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const receita = await prisma.receitaProduto.findMany({
    where: { produtoId: id },
    include: { ingrediente: true },
    orderBy: { ingrediente: { nome: 'asc' } },
  })

  return Response.json(receita)
}

// Replace the entire recipe for a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const produto = await prisma.produto.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!produto) {
    return Response.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const body = await request.json()
  // body: Array<{ ingredienteId: string; quantidade: number }>
  const itens: { ingredienteId: string; quantidade: number }[] = body

  if (!Array.isArray(itens)) {
    return Response.json({ error: 'Formato inválido' }, { status: 400 })
  }

  // Verify all ingredients belong to this user
  const ingredienteIds = itens.map((i) => i.ingredienteId)
  const ingredientesValidos = await prisma.ingrediente.findMany({
    where: { id: { in: ingredienteIds }, userId: session.user.id },
    select: { id: true },
  })
  const validIds = new Set(ingredientesValidos.map((i) => i.id))
  const invalid = ingredienteIds.find((id) => !validIds.has(id))
  if (invalid) {
    return Response.json({ error: 'Ingrediente inválido' }, { status: 400 })
  }

  // Replace atomically
  await prisma.$transaction([
    prisma.receitaProduto.deleteMany({ where: { produtoId: id } }),
    ...itens
      .filter((i) => i.quantidade > 0)
      .map((i) =>
        prisma.receitaProduto.create({
          data: { produtoId: id, ingredienteId: i.ingredienteId, quantidade: i.quantidade },
        })
      ),
  ])

  const receita = await prisma.receitaProduto.findMany({
    where: { produtoId: id },
    include: { ingrediente: true },
    orderBy: { ingrediente: { nome: 'asc' } },
  })

  return Response.json(receita)
}
