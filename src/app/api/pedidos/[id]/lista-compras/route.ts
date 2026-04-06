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
      itens: {
        include: {
          produto: {
            include: {
              receita: {
                include: { ingrediente: true },
              },
            },
          },
        },
      },
    },
  })

  if (!pedido) {
    return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  // Agregar ingredientes necessários por todos os itens do pedido
  const ingredientesMap = new Map<
    string,
    {
      id: string
      nome: string
      unidade: string
      quantidadeNecessaria: number
      estoqueAtual: number
    }
  >()

  for (const item of pedido.itens) {
    for (const receita of item.produto.receita) {
      const ing = receita.ingrediente
      const qtdNecessaria = receita.quantidade * item.quantidade

      if (ingredientesMap.has(ing.id)) {
        const existing = ingredientesMap.get(ing.id)!
        existing.quantidadeNecessaria += qtdNecessaria
      } else {
        ingredientesMap.set(ing.id, {
          id: ing.id,
          nome: ing.nome,
          unidade: ing.unidade,
          quantidadeNecessaria: qtdNecessaria,
          estoqueAtual: ing.estoqueAtual,
        })
      }
    }
  }

  const listaCompras = Array.from(ingredientesMap.values()).map((ing) => ({
    ...ing,
    falta: Math.max(0, ing.quantidadeNecessaria - ing.estoqueAtual),
  }))

  // Ordenar: itens que faltam primeiro, depois por nome
  listaCompras.sort((a, b) => {
    if (a.falta > 0 && b.falta === 0) return -1
    if (a.falta === 0 && b.falta > 0) return 1
    return a.nome.localeCompare(b.nome)
  })

  return Response.json(listaCompras)
}
