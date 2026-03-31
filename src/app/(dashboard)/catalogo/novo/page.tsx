'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Categoria {
  id: string
  nome: string
}

export default function NovoProdutoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [ativo, setAtivo] = useState(true)

  useEffect(() => {
    fetch('/api/categorias')
      .then((r) => r.json())
      .then(setCategorias)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome') as string,
      preco: parseFloat(formData.get('preco') as string) || 0,
      categoriaId: (formData.get('categoriaId') as string) || null,
      descricao: (formData.get('descricao') as string) || null,
      custoEstimado:
        parseFloat(formData.get('custoEstimado') as string) || null,
      tempoProducao:
        parseInt(formData.get('tempoProducao') as string) || null,
      ativo,
    }

    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao criar produto')
      }

      toast.success('Produto criado com sucesso!')
      router.push('/catalogo')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          aria-label="Voltar para catálogo"
        >
          <Link href="/catalogo">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Novo Produto</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do produto *</Label>
              <Input
                id="nome"
                name="nome"
                required
                placeholder="Ex: Bolo de Morango com Chantilly"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  name="preco"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custoEstimado">Custo estimado (R$)</Label>
                <Input
                  id="custoEstimado"
                  name="custoEstimado"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoriaId">Categoria</Label>
                <Select id="categoriaId" name="categoriaId">
                  <option value="">Sem categoria</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempoProducao">
                  Tempo de produção (horas)
                </Label>
                <Input
                  id="tempoProducao"
                  name="tempoProducao"
                  type="number"
                  min="0"
                  placeholder="Ex: 4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva o produto, ingredientes, tamanhos disponíveis..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={ativo}
                aria-label="Produto ativo"
                onClick={() => setAtivo(!ativo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  ativo ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ativo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <Label htmlFor="ativo" className="cursor-pointer">
                {ativo ? 'Produto ativo' : 'Produto inativo'}
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && (
                  <Loader2
                    className="h-4 w-4 mr-2 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Salvar Produto
              </Button>
              <Button asChild variant="outline">
                <Link href="/catalogo">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
