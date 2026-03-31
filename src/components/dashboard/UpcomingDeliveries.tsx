import Link from 'next/link'
import { formatDate, formatCurrency, deliveryUrgency, statusLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Truck, AlertCircle } from 'lucide-react'

interface Delivery {
  id: string
  numero: number
  dataEntrega: Date
  status: string
  valorFinal: number
  cliente: {
    nome: string
    sobrenome: string
  } | null
}

interface UpcomingDeliveriesProps {
  deliveries: Delivery[]
}

const urgencyBorder: Record<string, string> = {
  overdue: 'border-l-red-500',
  critical: 'border-l-orange-500',
  warning: 'border-l-yellow-500',
  ok: 'border-l-green-500',
}

const urgencyLabel: Record<string, string> = {
  overdue: 'Atrasado',
  critical: 'Hoje',
  warning: 'Amanhã',
  ok: '',
}

export function UpcomingDeliveries({ deliveries }: UpcomingDeliveriesProps) {
  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Truck className="h-10 w-10 text-muted-foreground mb-3" aria-hidden="true" />
        <p className="text-muted-foreground text-sm">
          Nenhuma entrega próxima
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {deliveries.map((delivery) => {
        const urgency = deliveryUrgency(delivery.dataEntrega)
        return (
          <li key={delivery.id}>
            <Link
              href={`/pedidos/${delivery.id}`}
              className={cn(
                'flex items-center justify-between rounded-xl border border-l-4 bg-card px-4 py-3 hover:bg-muted/50 transition-all duration-200 press-scale',
                urgencyBorder[urgency]
              )}
            >
              <div className="flex items-center gap-3">
                {(urgency === 'overdue' || urgency === 'critical') && (
                  <AlertCircle
                    className="h-4 w-4 text-red-500 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p className="text-sm font-medium">
                    #{delivery.numero} — {delivery.cliente
                      ? `${delivery.cliente.nome} ${delivery.cliente.sobrenome}`
                      : 'Sem cliente'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(delivery.dataEntrega)} •{' '}
                    {statusLabel(delivery.status)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {formatCurrency(delivery.valorFinal)}
                </p>
                {urgencyLabel[urgency] && (
                  <p
                    className={cn(
                      'text-xs font-medium',
                      urgency === 'overdue' && 'text-red-600',
                      urgency === 'critical' && 'text-orange-600',
                      urgency === 'warning' && 'text-yellow-600'
                    )}
                  >
                    {urgencyLabel[urgency]}
                  </p>
                )}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
