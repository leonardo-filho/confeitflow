'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { KanbanCard } from './KanbanCard'
import { statusLabel, progressoParaStatus } from '@/lib/utils'
import { cn } from '@/lib/utils'

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

const STATUSES = [
  'RECEBIDO',
  'CONFIRMADO',
  'EM_PRODUCAO',
  'DECORACAO',
  'PRONTO',
  'ENTREGUE',
] as const

const columnColors: Record<string, string> = {
  RECEBIDO: 'border-t-gray-400',
  CONFIRMADO: 'border-t-blue-500',
  EM_PRODUCAO: 'border-t-yellow-500',
  DECORACAO: 'border-t-purple-500',
  PRONTO: 'border-t-green-500',
  ENTREGUE: 'border-t-emerald-500',
}

interface SortableCardProps {
  pedido: Pedido
}

function SortableCard({ pedido }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pedido.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <KanbanCard pedido={pedido} isDragging={isDragging} />
    </div>
  )
}

interface KanbanBoardProps {
  initialPedidos: Pedido[]
}

export function KanbanBoard({ initialPedidos }: KanbanBoardProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const newStatus = STATUSES.find((s) => s === overId)
    if (!newStatus) return

    const activePedido = pedidos.find((p) => p.id === activeId)
    if (!activePedido || activePedido.status === newStatus) return

    const newProgresso = progressoParaStatus(newStatus)

    setPedidos((prev) =>
      prev.map((p) =>
        p.id === activeId
          ? { ...p, status: newStatus, progresso: newProgresso }
          : p
      )
    )

    try {
      const res = await fetch(`/api/pedidos/${activeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Falha ao atualizar status')
      }

      toast.success(`Pedido movido para ${statusLabel(newStatus)}`)
    } catch {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === activeId
            ? {
              ...p,
              status: activePedido.status,
              progresso: activePedido.progresso,
            }
            : p
        )
      )
      toast.error('Erro ao atualizar status do pedido')
    }
  }

  const activePedido = pedidos.find((p) => p.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
        {STATUSES.map((status) => {
          const columnPedidos = pedidos.filter((p) => p.status === status)
          return (
            <SortableContext
              key={status}
              id={status}
              items={columnPedidos.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className={cn(
                  'flex flex-col rounded-lg border border-t-4 bg-muted/30 min-w-[270px] w-[270px] shrink-0',
                  columnColors[status]
                )}
              >
                <div className="flex items-center justify-between px-3 py-2.5 border-b">
                  <h3 className="text-sm font-semibold">{statusLabel(status)}</h3>
                  <span className="text-xs bg-background rounded-full px-2 py-0.5 font-medium">
                    {columnPedidos.length}
                  </span>
                </div>
                <div
                  id={status}
                  className="flex-1 p-2 space-y-2 min-h-[100px]"
                >
                  {columnPedidos.map((pedido) => (
                    <SortableCard key={pedido.id} pedido={pedido} />
                  ))}
                  {columnPedidos.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground rounded-lg border-2 border-dashed">
                      Sem pedidos
                    </div>
                  )}
                </div>
              </div>
            </SortableContext>
          )
        })}
      </div>
      <DragOverlay>
        {activePedido ? <KanbanCard pedido={activePedido} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
