import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, pagamentoLabel } from '@/lib/utils'
import { DollarSign, TrendingUp, ShoppingBag, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import Link from 'next/link'

export default async function FinanceiroPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    thisMonthData,
    lastMonthData,
    totalPedidos,
    pendingPayments,
  ] = await Promise.all([
    prisma.pedido.aggregate({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        status: { not: 'CANCELADO' },
      },
      _sum: { valorFinal: true },
      _count: true,
    }),
    prisma.pedido.aggregate({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { not: 'CANCELADO' },
      },
      _sum: { valorFinal: true },
      _count: true,
    }),
    prisma.pedido.count({
      where: {
        userId: session.user.id,
        status: { not: 'CANCELADO' },
      },
    }),
    prisma.pedido.findMany({
      where: {
        userId: session.user.id,
        statusPagamento: { in: ['PENDENTE', 'SINAL_PAGO'] },
        status: { notIn: ['CANCELADO', 'ENTREGUE'] },
      },
      include: { cliente: { select: { nome: true, sobrenome: true } } },
      orderBy: { dataEntrega: 'asc' },
      take: 20,
    }),
  ])

  const thisMonthRevenue = thisMonthData._sum.valorFinal ?? 0
  const lastMonthRevenue = lastMonthData._sum.valorFinal ?? 0
  const revenueChange =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0

  const paidCount = await prisma.pedido.count({
    where: {
      userId: session.user.id,
      statusPagamento: 'PAGO',
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    },
  })

  const avgTicket =
    thisMonthData._count > 0
      ? thisMonthRevenue / thisMonthData._count
      : 0

  const pendingTotal = pendingPayments.reduce(
    (sum, p) => sum + (p.valorFinal - p.valorPago),
    0
  )

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financeiro</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {monthNames[now.getMonth()]} {now.getFullYear()}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Faturamento do Mês
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(thisMonthRevenue)}
                </p>
                {lastMonthRevenue > 0 && (
                  <p
                    className={`text-xs mt-1 ${
                      revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {revenueChange >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(revenueChange).toFixed(1)}% vs mês anterior
                  </p>
                )}
              </div>
              <div className="rounded-lg p-2 bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mês Anterior
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(lastMonthRevenue)}
                </p>
              </div>
              <div className="rounded-lg p-2 bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ticket Médio
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(avgTicket)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {thisMonthData._count} pedidos
                </p>
              </div>
              <div className="rounded-lg p-2 bg-purple-100">
                <ShoppingBag className="h-5 w-5 text-purple-600" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  A Receber
                </p>
                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {formatCurrency(pendingTotal)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingPayments.length} pedido{pendingPayments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="rounded-lg p-2 bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagamentos Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Nenhum pagamento pendente
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-2 font-medium text-muted-foreground hidden md:table-cell">Entrega</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Status Pag.</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">A Receber</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">
                        <Link
                          href={`/pedidos/${p.id}`}
                          className="font-medium hover:text-primary"
                        >
                          #{p.numero}
                        </Link>
                      </td>
                      <td className="py-2">
                        {p.cliente.nome} {p.cliente.sobrenome}
                      </td>
                      <td className="py-2 hidden md:table-cell text-muted-foreground">
                        {formatDate(p.dataEntrega)}
                      </td>
                      <td className="py-2">
                        <StatusBadge status={p.statusPagamento} type="pagamento" />
                      </td>
                      <td className="py-2 text-right font-semibold text-orange-600">
                        {formatCurrency(p.valorFinal - p.valorPago)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
