import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [activeOrders, deliveriesToday, deliveriesWeek, monthRevenue] =
    await Promise.all([
      prisma.pedido.count({
        where: {
          userId: session.user.id,
          status: { notIn: ['ENTREGUE', 'CANCELADO'] },
        },
      }),
      prisma.pedido.count({
        where: {
          userId: session.user.id,
          dataEntrega: { gte: startOfToday, lte: endOfToday },
          status: { notIn: ['ENTREGUE', 'CANCELADO'] },
        },
      }),
      prisma.pedido.count({
        where: {
          userId: session.user.id,
          dataEntrega: { gte: now, lte: endOfWeek },
          status: { notIn: ['ENTREGUE', 'CANCELADO'] },
        },
      }),
      prisma.pedido.aggregate({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { not: 'CANCELADO' },
        },
        _sum: { valorFinal: true },
      }),
    ])

  return Response.json({
    activeOrders,
    deliveriesToday,
    deliveriesWeek,
    monthRevenue: monthRevenue._sum.valorFinal ?? 0,
  })
}
