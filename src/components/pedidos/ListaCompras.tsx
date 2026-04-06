'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ItemCompra {
  id: string
  nome: string
  unidade: string
  quantidadeNecessaria: number
  estoqueAtual: number
  falta: number
}

function formatQuantidade(valor: number): string {
  return valor % 1 === 0 ? valor.toString() : valor.toFixed(2)
}

export function ListaCompras({ pedidoId }: { pedidoId: string }) {
  const [itens, setItens] = useState<ItemCompra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/pedidos/${pedidoId}/lista-compras`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setItens)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [pedidoId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Lista de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) return null

  if (itens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Lista de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Nenhum produto possui receita cadastrada.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalFaltando = itens.filter((i) => i.falta > 0).length
  const todosOk = totalFaltando === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Lista de Compras
          </CardTitle>
          {todosOk ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Estoque OK
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              {totalFaltando} {totalFaltando === 1 ? 'item faltando' : 'itens faltando'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b">
            <span>Ingrediente</span>
            <span className="text-right w-20">Necessário</span>
            <span className="text-right w-20">Estoque</span>
            <span className="text-right w-20">Falta</span>
          </div>

          {itens.map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-[1fr_auto_auto_auto] gap-3 py-2 border-b last:border-0 text-sm ${
                item.falta > 0 ? 'bg-amber-50/50 dark:bg-amber-950/10 -mx-2 px-2 rounded' : ''
              }`}
            >
              <span className="font-medium truncate">{item.nome}</span>
              <span className="text-right w-20 text-muted-foreground">
                {formatQuantidade(item.quantidadeNecessaria)} {item.unidade}
              </span>
              <span className="text-right w-20 text-muted-foreground">
                {formatQuantidade(item.estoqueAtual)} {item.unidade}
              </span>
              <span
                className={`text-right w-20 font-semibold ${
                  item.falta > 0 ? 'text-amber-600' : 'text-green-600'
                }`}
              >
                {item.falta > 0
                  ? `${formatQuantidade(item.falta)} ${item.unidade}`
                  : '---'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
