import Link from 'next/link'
import { formatCurrency, deliveryUrgency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
import { UpdatePedidoButton } from './UpdatePedidoButton'

interface KanbanCardProps {
  pedido: {
    id: string
    numero: number
    dataEntrega: Date
    status: string
    valorFinal: number
    progresso: number
    cliente: {
      nome: string
      sobrenome: string
    } | null
    itens: Array<{
      quantidade: number
      produto: { nome: string }
    }>
  }
  isDragging?: boolean
}

const urgencyBorderLeft: Record<string, string> = {
  overdue: 'border-l-red-500',
  critical: 'border-l-orange-500',
  warning: 'border-l-yellow-400',
  ok: 'border-l-green-400',
}

const urgencyProgressBar: Record<string, string> = {
  overdue: 'bg-red-500',
  critical: 'bg-orange-500',
  warning: 'bg-yellow-400',
  ok: 'bg-primary',
}

const urgencyBadge: Record<string, string> = {
  overdue: 'bg-red-100 text-red-700 border-red-200',
  critical: 'bg-orange-100 text-orange-700 border-orange-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ok: 'bg-green-100 text-green-700 border-green-200',
}

function getDeliveryLabel(dataEntrega: Date | string): string {
  const days = differenceInCalendarDays(new Date(dataEntrega), new Date())
  if (days < 0) return 'ATRASADO'
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Amanhã'
  return `${days} dias`
}

export function KanbanCard({ pedido, isDragging }: KanbanCardProps) {
  const urgency = deliveryUrgency(pedido.dataEntrega)
  const deliveryLabel = getDeliveryLabel(pedido.dataEntrega)

  return (
    <Link href={`/pedidos/${pedido.id}`}>
      <div
        className={cn(
          'rounded-lg border border-l-4 bg-card p-3 shadow-sm',
          'hover:shadow-md transition-shadow duration-200',
          !isDragging ? 'cursor-grab active:cursor-grabbing' : 'cursor-grabbing',
          urgencyBorderLeft[urgency],
          isDragging && 'opacity-50 rotate-2 shadow-lg'
        )}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            #{pedido.numero}
          </span>
          <div className="flex items-center gap-1.5">
            {(urgency === 'overdue' || urgency === 'critical') && (
              <AlertTriangle
                className="h-3.5 w-3.5 text-orange-500 shrink-0"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                'text-xs font-semibold px-1.5 py-0.5 rounded border',
                urgencyBadge[urgency]
              )}
            >
              {deliveryLabel}
            </span>
            <UpdatePedidoButton
              pedido={{
                id: pedido.id,
                numero: pedido.numero,
                status: pedido.status,
                progresso: pedido.progresso,
              }}
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-1 opacity-50 hover:opacity-100 transition-opacity"
              showText={false}
            />
          </div>
        </div>

        <p className="text-sm font-semibold leading-tight mb-2">
          {pedido.cliente
            ? `${pedido.cliente.nome} ${pedido.cliente.sobrenome}`
            : <span className="text-muted-foreground italic">Sem cliente</span>}
        </p>

        {pedido.itens.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {pedido.itens.slice(0, 2).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border"
              >
                {item.quantidade}x {item.produto.nome}
              </span>
            ))}
            {pedido.itens.length > 2 && (
              <span className="inline-flex items-center text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border">
                +{pedido.itens.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 mb-2">
          <Clock className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat('pt-BR').format(new Date(pedido.dataEntrega))}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {pedido.progresso}%
            </span>
            <span className="text-xs font-medium tabular-nums">
              {formatCurrency(pedido.valorFinal)}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                urgencyProgressBar[urgency]
              )}
              style={{ width: `${pedido.progresso}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
