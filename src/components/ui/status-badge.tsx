import { cn, statusLabel, pagamentoLabel } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  type?: 'pedido' | 'pagamento'
  className?: string
}

const pedidoColors: Record<string, string> = {
  RECEBIDO: 'bg-gray-100 text-gray-700 border-gray-200',
  CONFIRMADO: 'bg-blue-100 text-blue-700 border-blue-200',
  EM_PRODUCAO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  DECORACAO: 'bg-purple-100 text-purple-700 border-purple-200',
  PRONTO: 'bg-green-100 text-green-700 border-green-200',
  ENTREGUE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELADO: 'bg-red-100 text-red-700 border-red-200',
}

const pagamentoColors: Record<string, string> = {
  PENDENTE: 'bg-orange-100 text-orange-700 border-orange-200',
  SINAL_PAGO: 'bg-blue-100 text-blue-700 border-blue-200',
  PAGO: 'bg-green-100 text-green-700 border-green-200',
  REEMBOLSADO: 'bg-gray-100 text-gray-700 border-gray-200',
}

export function StatusBadge({
  status,
  type = 'pedido',
  className,
}: StatusBadgeProps) {
  const colors =
    type === 'pagamento' ? pagamentoColors : pedidoColors
  const label =
    type === 'pagamento' ? pagamentoLabel(status) : statusLabel(status)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        colors[status] ?? 'bg-gray-100 text-gray-700 border-gray-200',
        className
      )}
    >
      {label}
    </span>
  )
}
