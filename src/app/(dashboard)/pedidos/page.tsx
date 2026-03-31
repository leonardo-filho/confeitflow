'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { KanbanBoard } from '@/components/pedidos/KanbanBoard'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatDate, formatCurrency, statusLabel } from '@/lib/utils'
import { Plus, LayoutGrid, List, Loader2 } from 'lucide-react'

type Pedido = {
  id: string
  numero: number
  status: string
  dataEntrega: Date
  valorFinal: number
  progresso: number
  cliente: { nome: string; sobrenome: string } | null
  itens: Array<{ quantidade: number; produto: { nome: string } }>
}

const ALL_STATUSES = [
  'RECEBIDO',
  'CONFIRMADO',
  'EM_PRODUCAO',
  'DECORACAO',
  'PRONTO',
  'ENTREGUE',
  'CANCELADO',
]

export default function PedidosPage() {
  const [view, setView] = useState<'kanban' | 'lista'>('kanban')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const url = statusFilter
          ? `/api/pedidos?status=${statusFilter}`
          : '/api/pedidos'
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setPedidos(data)
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${view === 'kanban'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
                }`}
              aria-label="Visualização Kanban"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              Kanban
            </button>
            <button
              onClick={() => setView('lista')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${view === 'lista'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
                }`}
              aria-label="Visualização em Lista"
            >
              <List className="h-4 w-4" aria-hidden="true" />
              Lista
            </button>
          </div>

          <Button asChild>
            <Link href="/pedidos/novo">
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      {view === 'lista' && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${!statusFilter
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-muted'
              }`}
          >
            Todos
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${statusFilter === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
                }`}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard initialPedidos={pedidos.filter((p) => p.status !== 'CANCELADO')} />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          {pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm mb-4">
                Nenhum pedido encontrado
              </p>
              <Button asChild>
                <Link href="/pedidos/novo">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Criar Pedido
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Cliente
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                      Entrega
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                      Valor
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">#{pedido.numero}</td>
                      <td className="px-4 py-3">
                        {pedido.cliente
                          ? `${pedido.cliente.nome} ${pedido.cliente.sobrenome}`
                          : <span className="text-muted-foreground italic">Sem cliente</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {formatDate(new Date(pedido.dataEntrega))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={pedido.status} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell font-medium">
                        {formatCurrency(pedido.valorFinal)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/pedidos/${pedido.id}`}>Ver</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
