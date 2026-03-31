import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import Link from 'next/link'
import { ShoppingBag, Truck, Calendar, DollarSign, Plus, Users, Sparkles } from 'lucide-react'
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
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
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
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground text-balance">
            Olá, {session.user.name?.split(' ')[0]} ✨
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
          <Button asChild size="sm" className="press-scale gradient-primary border-0 shadow-glow">
            <Link href="/pedidos/novo">
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="animate-slide-up stagger-1">
          <StatsCard
            title="Pedidos Ativos"
            value={data.activeOrders}
            icon={ShoppingBag}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            gradient="stat-gradient-orange"
          />
        </div>
        <div className="animate-slide-up stagger-2">
          <StatsCard
            title="Entregas Hoje"
            value={data.deliveriesToday}
            icon={Truck}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
            gradient="stat-gradient-blue"
          />
        </div>
        <div className="animate-slide-up stagger-3">
          <StatsCard
            title="Esta Semana"
            value={data.deliveriesWeek}
            icon={Calendar}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
            gradient="stat-gradient-purple"
          />
        </div>
        <div className="animate-slide-up stagger-4">
          <StatsCard
            title="Faturamento do Mês"
            value={formatCurrency(data.monthRevenue)}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBg="bg-green-100"
            gradient="stat-gradient-green"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <div className="rounded-xl border bg-card p-5 shadow-soft hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
              Próximas Entregas
            </h3>
            <Link
              href="/pedidos"
              className="text-sm text-primary hover:underline font-medium"
            >
              Ver todos
            </Link>
          </div>
          <Suspense fallback={<Skeleton className="h-40" />}>
            <UpcomingDeliveries deliveries={data.upcomingDeliveries} />
          </Suspense>
        </div>

        {/* Attention Required */}
        <div className="rounded-xl border bg-card p-5 shadow-soft hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500" aria-hidden="true" />
              Requerem Atenção
            </h3>
            {data.attentionOrders.length > 0 && (
              <span className="text-xs gradient-accent text-white rounded-full px-2.5 py-0.5 font-semibold">
                {data.attentionOrders.length}
              </span>
            )}
          </div>
          {data.attentionOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <ShoppingBag
                  className="h-6 w-6 text-green-500"
                  aria-hidden="true"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Tudo em dia! Nenhum pedido requer atenção 🎉
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
                        'flex items-center justify-between rounded-xl border border-l-4 bg-card px-4 py-3 hover:bg-muted/50 transition-all duration-200 press-scale',
                        urgencyBorderClass[urgency]
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          #{order.numero} — {order.cliente
                            ? `${order.cliente.nome} ${order.cliente.sobrenome}`
                            : 'Sem cliente'}
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

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-5 shadow-soft">
        <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="press-scale rounded-xl">
            <Link href="/pedidos/novo">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Novo Pedido
            </Link>
          </Button>
          <Button asChild variant="outline" className="press-scale rounded-xl">
            <Link href="/clientes/novo">
              <Users className="h-4 w-4 mr-2" aria-hidden="true" />
              Novo Cliente
            </Link>
          </Button>
          <Button asChild variant="outline" className="press-scale rounded-xl">
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
