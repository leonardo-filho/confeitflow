import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  iconBg: string
  gradient?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  gradient,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200 hover-lift',
        gradient || 'bg-card'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex items-center justify-center h-10 w-10 rounded-xl',
            iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
