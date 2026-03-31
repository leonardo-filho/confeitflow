import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')

  const clientes = await prisma.cliente.findMany({
    where: {
      userId: session.user.id,
      ...(q
        ? {
            OR: [
              { nome: { contains: q } },
              { sobrenome: { contains: q } },
              { telefone: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { pedidos: true } } },
    orderBy: { nome: 'asc' },
  })

  return Response.json(clientes)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { nome, sobrenome, telefone, email, endereco, bairro, cidade, observacoes } = body

    if (!nome || !sobrenome || !telefone) {
      return Response.json(
        { error: 'Nome, sobrenome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        sobrenome,
        telefone,
        email: email || null,
        endereco: endereco || null,
        bairro: bairro || null,
        cidade: cidade || null,
        observacoes: observacoes || null,
        userId: session.user.id,
      },
    })

    return Response.json(cliente, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}
