import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, atelieName } = body

    if (!name || !email || !password) {
      return Response.json(
        { error: 'Nome, e-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json(
        { error: 'E-mail já cadastrado' },
        { status: 409 }
      )
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password,
        atelieName: atelieName || null,
      },
    })

    const defaultCategories = [
      'Bolos Decorados',
      'Ovos de Colher',
      'Brigadeiros e Docinhos',
      'Tortas e Cheesecakes',
      'Brownies e Cookies',
      'Kits e Cestas',
    ]

    await prisma.categoria.createMany({
      data: defaultCategories.map((nome, i) => ({
        nome,
        ordem: i,
        userId: user.id,
      })),
    })

    return Response.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
