'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
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

type StatusType = (typeof STATUSES)[number]

const columnColors: Record<string, string> = {
  RECEBIDO: 'border-t-gray-400',
  CONFIRMADO: 'border-t-blue-500',
  EM_PRODUCAO: 'border-t-yellow-500',
  DECORACAO: 'border-t-purple-500',
  PRONTO: 'border-t-green-500',
  ENTREGUE: 'border-t-emerald-500',
}

// ── Droppable column ─────────────────────────────────────────────────────────

function DroppableColumn({
  status,
  pedidos,
  isOver,
}: {
  status: string
  pedidos: Pedido[]
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 p-2 space-y-2 min-h-[120px] rounded-lg transition-colors duration-150',
        isOver && 'bg-primary/5 ring-1 ring-primary/20'
      )}
    >
      {pedidos.map((pedido) => (
        <SortableCard key={pedido.id} pedido={pedido} />
      ))}
      {pedidos.length === 0 && (
        <div
          className={cn(
            'flex items-center justify-center h-20 text-xs rounded-lg border-2 border-dashed transition-colors',
            isOver
              ? 'border-primary/40 text-primary bg-primary/5'
              : 'border-muted-foreground/20 text-muted-foreground'
          )}
        >
          {isOver ? 'Soltar aqui' : 'Sem pedidos'}
        </div>
      )}
    </div>
  )
}

// ── Sortable card wrapper ────────────────────────────────────────────────────

function SortableCard({ pedido }: { pedido: Pedido }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pedido.id, data: { status: pedido.status } })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <KanbanCard pedido={pedido} isDragging={isDragging} />
    </div>
  )
}

// ── Board ────────────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  initialPedidos: Pedido[]
}

export function KanbanBoard({ initialPedidos }: KanbanBoardProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Resolve target column from a droppable/sortable id
  const resolveTargetColumn = useCallback(
    (overId: string): StatusType | null => {
      // Over a column directly
      const directCol = STATUSES.find((s) => s === overId)
      if (directCol) return directCol
      // Over a card — find which column that card is in
      const overCard = pedidos.find((p) => p.id === overId)
      if (overCard) return overCard.status as StatusType
      return null
    },
    [pedidos]
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragOver({ over }: DragOverEvent) {
    if (!over) {
      setOverColumnId(null)
      return
    }
    const col = resolveTargetColumn(over.id as string)
    setOverColumnId(col ?? null)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    setOverColumnId(null)

    if (!over) return

    const activeId = active.id as string
    const targetStatus = resolveTargetColumn(over.id as string)

    if (!targetStatus) return

    const activePedido = pedidos.find((p) => p.id === activeId)
    if (!activePedido || activePedido.status === targetStatus) return

    const previousStatus = activePedido.status
    const previousProgresso = activePedido.progresso
    const newProgresso = progressoParaStatus(targetStatus)

    // Optimistic update
    setPedidos((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, status: targetStatus, progresso: newProgresso } : p
      )
    )

    try {
      const res = await fetch(`/api/pedidos/${activeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Pedido #${activePedido.numero} → ${statusLabel(targetStatus)}`)
    } catch {
      // Revert on error
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === activeId
            ? { ...p, status: previousStatus, progresso: previousProgresso }
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
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {STATUSES.map((status) => {
          const columnPedidos = pedidos.filter((p) => p.status === status)
          const isOver = overColumnId === status && activeId !== null
          return (
            <div
              key={status}
              className={cn(
                'flex flex-col rounded-xl border border-t-4 bg-muted/30 min-w-[265px] w-[265px] shrink-0 transition-all duration-150',
                columnColors[status],
                isOver && 'shadow-md'
              )}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b">
                <h3 className="text-sm font-semibold">{statusLabel(status)}</h3>
                <span className="text-xs bg-background rounded-full px-2 py-0.5 font-medium tabular-nums">
                  {columnPedidos.length}
                </span>
              </div>
              <SortableContext
                items={columnPedidos.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumn
                  status={status}
                  pedidos={columnPedidos}
                  isOver={isOver}
                />
              </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activePedido ? (
          <div className="rotate-2 scale-105 shadow-2xl opacity-95">
            <KanbanCard pedido={activePedido} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
