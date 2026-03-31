import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { cn, statusLabel } from '@/lib/utils'

interface CalendarioPageProps {
  searchParams: Promise<{ mes?: string; ano?: string }>
}

const STATUS_COLORS: Record<string, string> = {
  RECEBIDO: 'bg-gray-400',
  CONFIRMADO: 'bg-blue-500',
  EM_PRODUCAO: 'bg-yellow-500',
  DECORACAO: 'bg-purple-500',
  PRONTO: 'bg-green-500',
  ENTREGUE: 'bg-emerald-500',
  CANCELADO: 'bg-red-400',
}

export default async function CalendarioPage({
  searchParams,
}: CalendarioPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { mes, ano } = await searchParams
  const now = new Date()
  const currentYear = parseInt(ano || String(now.getFullYear()))
  const currentMonth = parseInt(mes || String(now.getMonth() + 1)) - 1

  const startDate = new Date(currentYear, currentMonth - 1, 1)
  const endDate = new Date(currentYear, currentMonth + 2, 0)

  const pedidos = await prisma.pedido.findMany({
    where: {
      userId: session.user.id,
      dataEntrega: {
        gte: startDate,
        lte: endDate,
      },
      status: { not: 'CANCELADO' },
    },
    include: {
      cliente: { select: { nome: true, sobrenome: true } },
    },
    orderBy: { dataEntrega: 'asc' },
  })

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const pedidosByDay: Record<number, typeof pedidos> = {}
  pedidos.forEach((p) => {
    const d = new Date(p.dataEntrega)
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      const day = d.getDate()
      if (!pedidosByDay[day]) pedidosByDay[day] = []
      pedidosByDay[day].push(p)
    }
  })

  const prevMonth = currentMonth === 0 ? 12 : currentMonth
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const nextMonth = currentMonth === 11 ? 1 : currentMonth + 2
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const totalThisMonth = Object.values(pedidosByDay).flat().length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendário</h2>
        <p className="text-sm text-muted-foreground">
          {totalThisMonth} entrega{totalThisMonth !== 1 ? 's' : ''} este mês
        </p>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <Link
            href={`/calendario?mes=${prevMonth}&ano=${prevYear}`}
            className="text-sm font-medium hover:text-primary transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
          >
            ← Anterior
          </Link>
          <h3 className="text-lg font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <Link
            href={`/calendario?mes=${nextMonth}&ano=${nextYear}`}
            className="text-sm font-medium hover:text-primary transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
          >
            Próximo →
          </Link>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b">
          {dayNames.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r p-1 bg-muted/20" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayPedidos = pedidosByDay[day] || []
            const isToday =
              day === now.getDate() &&
              currentMonth === now.getMonth() &&
              currentYear === now.getFullYear()

            return (
              <div
                key={day}
                className={cn(
                  'min-h-[100px] border-b border-r p-1',
                  isToday && 'bg-primary/5'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1',
                    isToday && 'bg-primary text-primary-foreground'
                  )}
                >
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayPedidos.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/pedidos/${p.id}`}
                      className="flex items-center gap-1 rounded text-xs px-1 py-0.5 hover:bg-muted transition-colors truncate"
                      title={`#${p.numero} ${p.cliente.nome} ${p.cliente.sobrenome}`}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full shrink-0',
                          STATUS_COLORS[p.status]
                        )}
                      />
                      <span className="truncate">
                        #{p.numero} {p.cliente.nome}
                      </span>
                    </Link>
                  ))}
                  {dayPedidos.length > 3 && (
                    <p className="text-xs text-muted-foreground px-1">
                      +{dayPedidos.length - 3} mais
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={cn('h-3 w-3 rounded-full', color)} />
            <span className="text-muted-foreground">{statusLabel(status)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
