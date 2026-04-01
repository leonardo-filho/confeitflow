import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const ingredientes = await prisma.ingrediente.findMany({
    where: { userId: session.user.id },
    orderBy: { nome: 'asc' },
  })

  return Response.json(ingredientes)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nome, unidade, estoqueAtual, estoqueMinimo } = body

    if (!nome) {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const ingrediente = await prisma.ingrediente.create({
      data: {
        nome,
        unidade: unidade || 'un',
        estoqueAtual: estoqueAtual ?? 0,
        estoqueMinimo: estoqueMinimo ?? 0,
        userId: session.user.id,
      },
    })

    return Response.json(ingrediente, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar ingrediente' }, { status: 500 })
  }
}
