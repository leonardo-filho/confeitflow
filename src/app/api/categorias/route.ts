import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const categorias = await prisma.categoria.findMany({
    where: { userId: session.user.id },
    orderBy: { ordem: 'asc' },
  })

  return Response.json(categorias)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nome, descricao, ordem } = body

    if (!nome) {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        descricao: descricao || null,
        ordem: ordem ?? 0,
        userId: session.user.id,
      },
    })

    return Response.json(categoria, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
