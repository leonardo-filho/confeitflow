'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Trash2, Loader2, Sparkles } from 'lucide-react'

interface ItemCompra {
  id: string
  nome: string
  quantidade: number
  unidade: string
  comprado: boolean
}

export function ListaCompras({ pedidoId }: { pedidoId: string }) {
  const [itens, setItens] = useState<ItemCompra[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [nome, setNome] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('un')
  const inputRef = useRef<HTMLInputElement>(null)

  const baseUrl = `/api/pedidos/${pedidoId}/lista-compras`

  useEffect(() => {
    fetch(baseUrl)
      .then((r) => (r.ok ? r.json() : []))
      .then(setItens)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [baseUrl])

  async function addItem() {
    if (!nome.trim()) return
    setAdding(true)
    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          quantidade: parseFloat(quantidade) || 1,
          unidade: unidade.trim() || 'un',
        }),
      })
      if (!res.ok) throw new Error()
      const item = await res.json()
      setItens((prev) => [...prev, item])
      setNome('')
      setQuantidade('')
      setUnidade('un')
      inputRef.current?.focus()
    } catch {
      toast.error('Erro ao adicionar item')
    } finally {
      setAdding(false)
    }
  }

  async function toggleItem(item: ItemCompra) {
    const newValue = !item.comprado
    setItens((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, comprado: newValue } : i))
    )
    try {
      const res = await fetch(baseUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, comprado: newValue }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setItens((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, comprado: !newValue } : i))
      )
      toast.error('Erro ao atualizar item')
    }
  }

  async function removeItem(itemId: string) {
    const prev = itens
    setItens((items) => items.filter((i) => i.id !== itemId))
    try {
      const res = await fetch(`${baseUrl}?itemId=${itemId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
    } catch {
      setItens(prev)
      toast.error('Erro ao remover item')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  const comprados = itens.filter((i) => i.comprado).length
  const total = itens.length
  const pct = total > 0 ? Math.round((comprados / total) * 100) : 0
  const allDone = total > 0 && comprados === total

  function formatQtd(v: number) {
    return v % 1 === 0 ? v.toString() : v.toFixed(2)
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card overflow-hidden shadow-soft">
        <div className="px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Lista de Compras</span>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const pendentes = itens.filter((i) => !i.comprado)
  const concluidos = itens.filter((i) => i.comprado)

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-soft">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm">Lista de Compras</span>
              {total > 0 && (
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {comprados} de {total} {total === 1 ? 'item' : 'itens'}
                </p>
              )}
            </div>
          </div>

          {total > 0 && (
            <div className="flex items-center gap-2">
              {allDone && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 animate-scale-in">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tudo comprado!
                </span>
              )}
              <div className="relative h-9 w-9">
                <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="14"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18" cy="18" r="14"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${pct * 0.88} 88`}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                  {pct}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Add item form */}
        <div
          className="flex gap-2 p-1 rounded-xl bg-muted/40 border border-transparent focus-within:border-primary/20 focus-within:bg-muted/60 transition-all duration-200"
          onKeyDown={handleKeyDown}
        >
          <Input
            ref={inputRef}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Adicionar item..."
            className="flex-1 h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
            disabled={adding}
          />
          <Input
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder="1"
            type="number"
            min="0"
            step="0.1"
            className="w-14 h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 text-center"
            disabled={adding}
          />
          <Input
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            placeholder="un"
            className="w-12 h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 text-center text-muted-foreground"
            disabled={adding}
          />
          <Button
            size="sm"
            className="h-9 w-9 shrink-0 rounded-lg gradient-primary shadow-glow border-0 hover:opacity-90 transition-opacity"
            onClick={addItem}
            disabled={adding || !nome.trim()}
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Empty state */}
        {itens.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
              <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum item na lista ainda
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Adicione os ingredientes que precisa comprar
            </p>
          </div>
        )}

        {/* Pending items */}
        {pendentes.length > 0 && (
          <ul className="space-y-1">
            {pendentes.map((item) => (
              <li
                key={item.id}
                className="lista-compras-item flex items-center gap-3 rounded-xl px-3 py-2.5 group hover:bg-muted/30 transition-all duration-150"
              >
                <button
                  onClick={() => toggleItem(item)}
                  className="shrink-0 w-[22px] h-[22px] rounded-full border-2 border-primary/30 flex items-center justify-center transition-all duration-200 hover:border-primary hover:scale-110 active:scale-95"
                  aria-label="Marcar como comprado"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{item.nome}</span>
                </div>

                <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md shrink-0">
                  {formatQtd(item.quantidade)} {item.unidade}
                </span>

                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-all duration-150 p-1 -mr-1"
                  aria-label="Remover item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Completed items */}
        {concluidos.length > 0 && (
          <div>
            {pendentes.length > 0 && (
              <div className="flex items-center gap-2 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
                  Comprados
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
            <ul className="space-y-0.5">
              {concluidos.map((item) => (
                <li
                  key={item.id}
                  className="lista-compras-item flex items-center gap-3 rounded-xl px-3 py-2 group transition-all duration-150"
                >
                  <button
                    onClick={() => toggleItem(item)}
                    className="shrink-0 w-[22px] h-[22px] rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                    aria-label="Desmarcar"
                  >
                    <svg className="h-3 w-3 text-primary" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <span className="flex-1 min-w-0 text-sm text-muted-foreground/60 line-through decoration-primary/30">
                    {item.nome}
                  </span>

                  <span className="text-[11px] text-muted-foreground/40 shrink-0">
                    {formatQtd(item.quantidade)} {item.unidade}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all duration-150 p-1 -mr-1"
                    aria-label="Remover item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress bar */}
        {total > 0 && (
          <div className="progress-bar-premium h-1.5">
            <div
              className="progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
