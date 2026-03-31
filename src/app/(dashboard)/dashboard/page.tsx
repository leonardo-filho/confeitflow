import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import Link from 'next/link'
import { ShoppingBag, Truck, Calendar, DollarSign, Plus, Users } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { UpcomingDeliveries } from '@/components/dashboard/UpcomingDeliveries'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, deliveryUrgency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

async function getDashboardData(userId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [
    activeOrders,
    deliveriesToday,
    deliveriesWeek,
    monthRevenue,
    upcomingDeliveries,
    attentionOrders,
  ] = await Promise.all([
    prisma.pedido.count({
      where: {
        userId,
        status: { notIn: ['ENTREGUE', 'CANCELADO'] },
      },
    }),
    prisma.pedido.count({
      where: {
        userId,
        dataEntrega: { gte: startOfToday, lte: endOfToday },
        status: { notIn: ['ENTREGUE', 'CANCELADO'] },
      },
    }),
    prisma.pedido.count({
      where: {
        userId,
        dataEntrega: { gte: now, lte: endOfWeek },
        status: { notIn: ['ENTREGUE', 'CANCELADO'] },
      },
    }),
    prisma.pedido.aggregate({
      where: {
        userId,
        dataEntrega: { gte: startOfMonth, lte: endOfMonth },
        status: { not: 'CANCELADO' },
      },
      _sum: { valorFinal: true },
    }),
    prisma.pedido.findMany({
      where: {
        userId,
        status: { notIn: ['ENTREGUE', 'CANCELADO'] },
      },
      orderBy: { dataEntrega: 'asc' },
      take: 5,
      include: { cliente: { select: { nome: true, sobrenome: true } } },
    }),
    prisma.pedido.findMany({
      where: {
        userId,
        status: { in: ['RECEBIDO', 'CONFIRMADO'] },
        dataEntrega: {
          lte: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        },
      },
      orderBy: { dataEntrega: 'asc' },
      take: 10,
      include: { cliente: { select: { nome: true, sobrenome: true } } },
    }),
  ])

  return {
    activeOrders,
    deliveriesToday,
    deliveriesWeek,
    monthRevenue: monthRevenue._sum.valorFinal ?? 0,
    upcomingDeliveries,
    attentionOrders,
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const data = await getDashboardData(session.user.id)

  const urgencyBorderClass: Record<string, string> = {
    overdue: 'border-l-red-500',
    critical: 'border-l-orange-500',
    warning: 'border-l-yellow-500',
    ok: 'border-l-green-500',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Olá, {session.user.name?.split(' ')[0]}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date())}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/pedidos/novo">
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Pedidos Ativos"
          value={data.activeOrders}
          icon={ShoppingBag}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          title="Entregas Hoje"
          value={data.deliveriesToday}
          icon={Truck}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Esta Semana"
          value={data.deliveriesWeek}
          icon={Calendar}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Faturamento do Mês"
          value={formatCurrency(data.monthRevenue)}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Próximas Entregas</h3>
            <Link
              href="/pedidos"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <Suspense fallback={<Skeleton className="h-40" />}>
            <UpcomingDeliveries deliveries={data.upcomingDeliveries} />
          </Suspense>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Requerem Atenção
            </h3>
            {data.attentionOrders.length > 0 && (
              <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 font-medium">
                {data.attentionOrders.length}
              </span>
            )}
          </div>
          {data.attentionOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ShoppingBag
                className="h-10 w-10 text-muted-foreground mb-3"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-sm">
                Nenhum pedido requer atenção
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.attentionOrders.map((order) => {
                const urgency = deliveryUrgency(order.dataEntrega)
                return (
                  <li key={order.id}>
                    <Link
                      href={`/pedidos/${order.id}`}
                      className={cn(
                        'flex items-center justify-between rounded-lg border border-l-4 bg-card px-4 py-3 hover:bg-muted/50 transition-colors',
                        urgencyBorderClass[urgency]
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          #{order.numero} — {order.cliente ? `${order.cliente.nome} ${order.cliente.sobrenome}` : 'Sem cliente'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Entrega: {formatDate(order.dataEntrega)}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/pedidos/novo">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Novo Pedido
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/clientes/novo">
              <Users className="h-4 w-4 mr-2" aria-hidden="true" />
              Novo Cliente
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/catalogo/novo">
              <ShoppingBag className="h-4 w-4 mr-2" aria-hidden="true" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
