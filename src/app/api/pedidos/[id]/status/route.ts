import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { progressoParaStatus, statusLabel } from '@/lib/utils'

const VALID_STATUSES = [
  'RECEBIDO',
  'CONFIRMADO',
  'EM_PRODUCAO',
  'DECORACAO',
  'PRONTO',
  'ENTREGUE',
  'CANCELADO',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.pedido.findUnique({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return Response.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  const body = await request.json()
  const { status, progresso } = body

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: 'Status inválido' }, { status: 400 })
  }

  // Se progresso foi passado, garante que seja um numero válido entre 0 e 100
  // Se não foi passado, ou se for algo inválido, usa a regra automática
  let finalProgresso: number
  if (typeof progresso === 'number' && progresso >= 0 && progresso <= 100) {
    finalProgresso = Math.round(progresso)
  } else {
    finalProgresso = progressoParaStatus(status)
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data: {
      status,
      progresso: finalProgresso,
      historico: {
        create: {
          acao: `Status atualizado para ${statusLabel(status)}`,
          detalhes: `Anterior: ${statusLabel(existing.status)}`,
        },
      },
    },
  })

  return Response.json(pedido)
}
