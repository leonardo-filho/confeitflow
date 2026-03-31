import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateFull(date: Date | string): string {
  return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '')
  const number = digits.startsWith('55') ? digits : `55${digits}`
  const msg = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${msg}`
}

export function deliveryUrgency(
  dataEntrega: Date | string
): 'overdue' | 'critical' | 'warning' | 'ok' {
  const hours = differenceInHours(new Date(dataEntrega), new Date())
  if (hours < 0) return 'overdue'
  if (hours < 24) return 'critical'
  if (hours < 48) return 'warning'
  return 'ok'
}

export function progressoParaStatus(status: string): number {
  const map: Record<string, number> = {
    RECEBIDO: 0,
    CONFIRMADO: 15,
    EM_PRODUCAO: 40,
    DECORACAO: 70,
    PRONTO: 90,
    ENTREGUE: 100,
    CANCELADO: 0,
  }
  return map[status] ?? 0
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    RECEBIDO: 'Recebido',
    CONFIRMADO: 'Confirmado',
    EM_PRODUCAO: 'Em Produção',
    DECORACAO: 'Decoração',
    PRONTO: 'Pronto',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
  }
  return map[status] ?? status
}

export function pagamentoLabel(status: string): string {
  const map: Record<string, string> = {
    PENDENTE: 'Pendente',
    SINAL_PAGO: 'Sinal Pago',
    PAGO: 'Pago',
    REEMBOLSADO: 'Reembolsado',
  }
  return map[status] ?? status
}
