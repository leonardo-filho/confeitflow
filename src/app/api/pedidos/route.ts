import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')

  const pedidos = await prisma.pedido.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      cliente: { select: { nome: true, sobrenome: true } },
      itens: {
        include: { produto: { select: { nome: true } } },
      },
    },
    orderBy: { dataEntrega: 'asc' },
  })

  return Response.json(pedidos)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      clienteId,
      itens,
      dataEntrega,
      horaEntrega,
      tipoEntrega,
      enderecoEntrega,
      taxaEntrega,
      especificacoes,
      observacoesInternas,
      valorTotal,
      desconto,
      valorFinal,
      statusPagamento,
      valorPago,
      formaPagamento,
    } = body

    if (!itens?.length || !dataEntrega) {
      return Response.json(
        { error: 'Itens e data de entrega são obrigatórios' },
        { status: 400 }
      )
    }

    // Auto-increment numero
    const lastPedido = await prisma.pedido.findFirst({
      where: { userId: session.user.id },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })
    const numero = (lastPedido?.numero ?? 0) + 1

    const pedido = await prisma.pedido.create({
      data: {
        numero,
        clienteId: clienteId || null,
        userId: session.user.id,
        dataEntrega: new Date(dataEntrega),
        horaEntrega: horaEntrega || null,
        tipoEntrega: tipoEntrega || 'RETIRADA',
        enderecoEntrega: enderecoEntrega || null,
        taxaEntrega: taxaEntrega || 0,
        especificacoes: especificacoes || null,
        observacoesInternas: observacoesInternas || null,
        valorTotal: valorTotal || 0,
        desconto: desconto || 0,
        valorFinal: valorFinal || 0,
        statusPagamento: statusPagamento || 'PENDENTE',
        valorPago: valorPago || 0,
        formaPagamento: formaPagamento || null,
        status: 'RECEBIDO',
        progresso: 0,
        itens: {
          create: itens.map(
            (item: {
              produtoId: string
              quantidade: number
              precoUnitario: number
              subtotal: number
              personalizacao?: string
            }) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              subtotal: item.subtotal,
              personalizacao: item.personalizacao || null,
            })
          ),
        },
        historico: {
          create: {
            acao: 'Pedido criado',
            detalhes: `Pedido #${numero} criado com ${itens.length} item(ns)`,
          },
        },
      },
      include: {
        cliente: true,
        itens: { include: { produto: true } },
      },
    })

    return Response.json(pedido, { status: 201 })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
