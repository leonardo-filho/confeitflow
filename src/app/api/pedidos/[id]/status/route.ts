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
  const { status } = body

  if (!VALID_STATUSES.includes(status)) {
    return Response.json({ error: 'Status inválido' }, { status: 400 })
  }

  const progresso = progressoParaStatus(status)

  const pedido = await prisma.pedido.update({
    where: { id },
    data: {
      status,
      progresso,
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
