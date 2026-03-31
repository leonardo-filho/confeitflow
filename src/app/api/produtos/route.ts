import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const produtos = await prisma.produto.findMany({
    where: { userId: session.user.id, ativo: true },
    include: { categoria: true },
    orderBy: { nome: 'asc' },
  })

  return Response.json(produtos)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nome, preco, categoriaId, descricao, custoEstimado, tempoProducao, ativo } = body

    if (!nome || preco === undefined) {
      return Response.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      )
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        preco,
        categoriaId: categoriaId || null,
        descricao: descricao || null,
        custoEstimado: custoEstimado || null,
        tempoProducao: tempoProducao || null,
        ativo: ativo !== false,
        userId: session.user.id,
      },
    })

    return Response.json(produto, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
