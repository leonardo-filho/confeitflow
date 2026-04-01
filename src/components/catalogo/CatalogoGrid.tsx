'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Package,
  Pencil,
  Plus,
  Trash2,
  ImageIcon,
  Loader2,
  ChefHat,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Categoria {
  id: string
  nome: string
}

interface Ingrediente {
  id: string
  nome: string
  unidade: string
  estoqueAtual: number
  estoqueMinimo: number
}

interface ReceitaItem {
  id: string
  quantidade: number
  ingredienteId: string
  ingrediente: Ingrediente
}

interface Produto {
  id: string
  nome: string
  descricao: string | null
  preco: number
  custoEstimado: number | null
  tempoProducao: number | null
  imagem: string | null
  ativo: boolean
  categoriaId: string | null
  categoria: Categoria | null
}

interface Props {
  produtos: Produto[]
  categorias: Categoria[]
  categoriaAtiva?: string
}

// ─── Tab type ─────────────────────────────────────────────────────────────────

type TabId = 'dados' | 'receita'

// ─── Image upload helper ───────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditProdutoModal({
  produto,
  categorias,
  onClose,
  onSaved,
}: {
  produto: Produto
  categorias: Categoria[]
  onClose: () => void
  onSaved: (updated: Produto) => void
}) {
  const [tab, setTab] = useState<TabId>('dados')
  const [saving, setSaving] = useState(false)
  const [loadingReceita, setLoadingReceita] = useState(false)

  // ── Dados fields ──────────────────────────────────────────────────────────
  const [nome, setNome] = useState(produto.nome)
  const [descricao, setDescricao] = useState(produto.descricao ?? '')
  const [preco, setPreco] = useState(String(produto.preco))
  const [custoEstimado, setCustoEstimado] = useState(
    produto.custoEstimado != null ? String(produto.custoEstimado) : ''
  )
  const [tempoProducao, setTempoProducao] = useState(
    produto.tempoProducao != null ? String(produto.tempoProducao) : ''
  )
  const [categoriaId, setCategoriaId] = useState(produto.categoriaId ?? '')
  const [ativo, setAtivo] = useState(produto.ativo)
  const [imagem, setImagem] = useState<string | null>(produto.imagem)
  const [imagePreview, setImagePreview] = useState<string | null>(produto.imagem)
  const [uploadingImg, setUploadingImg] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Receita fields ────────────────────────────────────────────────────────
  const [receita, setReceita] = useState<ReceitaItem[]>([])
  const [allIngredientes, setAllIngredientes] = useState<Ingrediente[]>([])
  const [receitaLoaded, setReceitaLoaded] = useState(false)
  const [unidades, setUnidades] = useState(1)
  const [novoIngredienteId, setNovoIngredienteId] = useState('')
  const [novaQtd, setNovaQtd] = useState('')

  // ── Image handling ────────────────────────────────────────────────────────

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.')
      return
    }
    setUploadingImg(true)
    try {
      const base64 = await fileToBase64(file)
      setImagem(base64)
      setImagePreview(base64)
    } catch {
      toast.error('Erro ao processar imagem')
    } finally {
      setUploadingImg(false)
    }
  }

  function removeImage() {
    setImagem(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Load receita on tab switch ────────────────────────────────────────────

  async function loadReceita() {
    if (receitaLoaded) return
    setLoadingReceita(true)
    try {
      const [receitaRes, ingredientesRes] = await Promise.all([
        fetch(`/api/produtos/${produto.id}/receita`),
        fetch('/api/ingredientes'),
      ])
      const [receitaData, ingredientesData] = await Promise.all([
        receitaRes.json(),
        ingredientesRes.json(),
      ])
      setReceita(Array.isArray(receitaData) ? receitaData : [])
      setAllIngredientes(Array.isArray(ingredientesData) ? ingredientesData : [])
      setReceitaLoaded(true)
    } catch {
      toast.error('Erro ao carregar receita')
    } finally {
      setLoadingReceita(false)
    }
  }

  function switchTab(t: TabId) {
    setTab(t)
    if (t === 'receita') loadReceita()
  }

  // ── Save dados ────────────────────────────────────────────────────────────

  async function saveDados() {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/produtos/${produto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao || null,
          preco: parseFloat(preco) || 0,
          custoEstimado: custoEstimado ? parseFloat(custoEstimado) : null,
          tempoProducao: tempoProducao ? parseInt(tempoProducao) : null,
          categoriaId: categoriaId || null,
          ativo,
          imagem,
        }),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      const updated = await res.json()
      const cat = categorias.find((c) => c.id === updated.categoriaId) ?? null
      onSaved({ ...updated, categoria: cat })
      toast.success('Produto atualizado!')
    } catch {
      toast.error('Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  // ── Receita helpers ───────────────────────────────────────────────────────

  function addReceitaItem() {
    if (!novoIngredienteId) {
      toast.error('Selecione um ingrediente')
      return
    }
    const qtd = parseFloat(novaQtd)
    if (!qtd || qtd <= 0) {
      toast.error('Informe a quantidade')
      return
    }
    const ingrediente = allIngredientes.find((i) => i.id === novoIngredienteId)
    if (!ingrediente) return
    if (receita.some((r) => r.ingredienteId === novoIngredienteId)) {
      toast.error('Ingrediente já adicionado. Edite a quantidade abaixo.')
      return
    }
    setReceita((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        quantidade: qtd,
        ingredienteId: novoIngredienteId,
        ingrediente,
      },
    ])
    setNovoIngredienteId('')
    setNovaQtd('')
  }

  function updateReceitaQtd(ingredienteId: string, qtd: number) {
    setReceita((prev) =>
      prev.map((r) =>
        r.ingredienteId === ingredienteId ? { ...r, quantidade: qtd } : r
      )
    )
  }

  function removeReceitaItem(ingredienteId: string) {
    setReceita((prev) => prev.filter((r) => r.ingredienteId !== ingredienteId))
  }

  async function saveReceita() {
    setSaving(true)
    try {
      const res = await fetch(`/api/produtos/${produto.id}/receita`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          receita.map((r) => ({
            ingredienteId: r.ingredienteId,
            quantidade: r.quantidade,
          }))
        ),
      })
      if (!res.ok) throw new Error('Erro ao salvar receita')
      const updated = await res.json()
      setReceita(updated)
      toast.success('Receita salva!')
    } catch {
      toast.error('Erro ao salvar receita')
    } finally {
      setSaving(false)
    }
  }

  // ── Available ingredients (not yet in recipe) ─────────────────────────────
  const disponiveisParaAdicionar = allIngredientes.filter(
    (i) => !receita.some((r) => r.ingredienteId === i.id)
  )

  // ── Production calculator ─────────────────────────────────────────────────
  function calcStatus(item: ReceitaItem) {
    const needed = item.quantidade * unidades
    const available = item.ingrediente.estoqueAtual
    const falta = needed - available
    return { needed, available, falta, ok: falta <= 0 }
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-lg font-bold truncate pr-6">{produto.nome}</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b shrink-0 px-6">
          <button
            onClick={() => switchTab('dados')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === 'dados'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Dados do Produto
            </span>
          </button>
          <button
            onClick={() => switchTab('receita')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === 'receita'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ChefHat className="h-3.5 w-3.5" />
              Receita & Produção
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── TAB: DADOS ─────────────────────────────────────────────── */}
          {tab === 'dados' && (
            <div className="p-6 space-y-5">
              {/* Image upload */}
              <div className="space-y-2">
                <Label>Foto do produto</Label>
                <div className="flex gap-4 items-start">
                  <div
                    className="relative w-28 h-28 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        {uploadingImg ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="h-7 w-7" />
                            <span className="text-[10px] text-center px-1">Clique para adicionar</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 justify-center pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImg}
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                      {imagePreview ? 'Trocar foto' : 'Adicionar foto'}
                    </Button>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={removeImage}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Remover
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">PNG, JPG até 5MB</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome do produto *</Label>
                <Input
                  id="edit-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Bolo de Morango com Chantilly"
                />
              </div>

              {/* Preço + Custo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-preco">Preço de venda (R$) *</Label>
                  <Input
                    id="edit-preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-custo">Custo estimado (R$)</Label>
                  <Input
                    id="edit-custo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={custoEstimado}
                    onChange={(e) => setCustoEstimado(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Categoria + Tempo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-categoria">Categoria</Label>
                  <select
                    id="edit-categoria"
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Sem categoria</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tempo">Tempo de produção (h)</Label>
                  <Input
                    id="edit-tempo"
                    type="number"
                    min="0"
                    step="1"
                    value={tempoProducao}
                    onChange={(e) => setTempoProducao(e.target.value)}
                    placeholder="Ex: 4"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição</Label>
                <Textarea
                  id="edit-descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o produto, sabores, tamanhos disponíveis..."
                  rows={3}
                />
              </div>

              {/* Ativo toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={ativo}
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
                <span className="text-sm">{ativo ? 'Produto ativo' : 'Produto inativo'}</span>
              </div>

              {/* Margem info */}
              {custoEstimado && parseFloat(custoEstimado) > 0 && parseFloat(preco) > 0 && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm flex gap-3">
                  <FlaskConical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Margem estimada: </span>
                    <span className={parseFloat(preco) > parseFloat(custoEstimado) ? 'text-green-600' : 'text-red-500'}>
                      {formatCurrency(parseFloat(preco) - parseFloat(custoEstimado))}
                      {' '}({Math.round(((parseFloat(preco) - parseFloat(custoEstimado)) / parseFloat(preco)) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: RECEITA ──────────────────────────────────────────────── */}
          {tab === 'receita' && (
            <div className="p-6 space-y-5">
              {loadingReceita ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Calculadora de produção */}
                  <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ChefHat className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Calculadora de Produção</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="unidades" className="shrink-0 text-sm">Quero produzir</Label>
                      <Input
                        id="unidades"
                        type="number"
                        min="1"
                        step="1"
                        value={unidades}
                        onChange={(e) => setUnidades(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 h-8 text-center"
                      />
                      <span className="text-sm text-muted-foreground">unidade(s)</span>
                    </div>

                    {receita.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Adicione ingredientes à receita abaixo para ver o que é necessário.
                      </p>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {receita.map((item) => {
                          const { needed, available, falta, ok } = calcStatus(item)
                          return (
                            <div
                              key={item.ingredienteId}
                              className={`flex items-center gap-3 rounded-lg p-2.5 text-sm ${
                                ok ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
                              }`}
                            >
                              {ok ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="font-medium truncate">{item.ingrediente.nome}</span>
                                <div className="text-xs text-muted-foreground">
                                  Precisa: <span className="font-medium">{needed}{item.ingrediente.unidade}</span>
                                  {' · '}
                                  Estoque: <span className="font-medium">{available}{item.ingrediente.unidade}</span>
                                </div>
                              </div>
                              {!ok && (
                                <span className="text-xs font-semibold text-red-600 shrink-0 whitespace-nowrap">
                                  Falta {falta.toFixed(1)}{item.ingrediente.unidade}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Recipe list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Ingredientes da receita</Label>
                      <span className="text-xs text-muted-foreground">
                        por unidade produzida
                      </span>
                    </div>

                    {receita.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
                        Nenhum ingrediente na receita ainda.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {receita.map((item) => (
                          <div
                            key={item.ingredienteId}
                            className="flex items-center gap-3 rounded-lg border bg-card p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.ingrediente.nome}</p>
                              <p className="text-xs text-muted-foreground">
                                Estoque atual: {item.ingrediente.estoqueAtual} {item.ingrediente.unidade}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.quantidade}
                                onChange={(e) =>
                                  updateReceitaQtd(item.ingredienteId, parseFloat(e.target.value) || 0)
                                }
                                className="w-20 h-8 text-right"
                              />
                              <span className="text-xs text-muted-foreground w-6 shrink-0">
                                {item.ingrediente.unidade}
                              </span>
                              <button
                                onClick={() => removeReceitaItem(item.ingredienteId)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                aria-label="Remover ingrediente"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add ingredient row */}
                    {allIngredientes.length === 0 ? (
                      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground text-center">
                        Cadastre ingredientes em{' '}
                        <Link href="/configuracoes" className="underline text-primary">
                          Configurações
                        </Link>{' '}
                        para montar a receita.
                      </div>
                    ) : disponiveisParaAdicionar.length > 0 ? (
                      <div className="flex gap-2 items-end pt-1">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Ingrediente</Label>
                          <select
                            value={novoIngredienteId}
                            onChange={(e) => setNovoIngredienteId(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="">Selecione...</option>
                            {disponiveisParaAdicionar.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.nome} ({i.unidade})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24 space-y-1">
                          <Label className="text-xs">Qtd</Label>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={novaQtd}
                            onChange={(e) => setNovaQtd(e.target.value)}
                            placeholder="0"
                            className="h-9"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={addReceitaItem}
                          className="h-9 shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        Todos os ingredientes cadastrados já estão na receita.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex gap-3 justify-end shrink-0 bg-background">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
          <Button
            onClick={tab === 'dados' ? saveDados : saveReceita}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {tab === 'dados' ? 'Salvar produto' : 'Salvar receita'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CatalogoGrid({ produtos: inicial, categorias, categoriaAtiva }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>(inicial)
  const [editando, setEditando] = useState<Produto | null>(null)

  const handleSaved = useCallback((updated: Produto) => {
    setProdutos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }, [])

  const filtrados = categoriaAtiva
    ? produtos.filter((p) => p.categoriaId === categoriaAtiva)
    : produtos

  if (filtrados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border bg-card">
        <Package className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
        <h3 className="font-semibold text-lg mb-2">
          {categoriaAtiva ? 'Nenhum produto nesta categoria' : 'Nenhum produto ainda'}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Adicione produtos ao seu catálogo para criar pedidos.
        </p>
        <Button asChild>
          <Link href="/catalogo/novo">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Adicionar Produto
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtrados.map((produto) => (
          <div
            key={produto.id}
            className="rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-200 group relative"
          >
            {/* Image */}
            <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
              {produto.imagem ? (
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              )}
              {/* Edit overlay */}
              <button
                onClick={() => setEditando(produto)}
                aria-label={`Editar ${produto.nome}`}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-foreground rounded-full p-2 shadow-lg">
                  <Pencil className="h-4 w-4" />
                </span>
              </button>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="font-semibold text-sm leading-tight line-clamp-2">{produto.nome}</p>
              {produto.categoria && (
                <p className="text-xs text-muted-foreground mt-0.5">{produto.categoria.nome}</p>
              )}
              <p className="font-bold text-primary mt-1.5 text-sm">
                {formatCurrency(produto.preco)}
              </p>
              {produto.tempoProducao && (
                <p className="text-xs text-muted-foreground">{produto.tempoProducao}h produção</p>
              )}
              {!produto.ativo && (
                <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Inativo
                </span>
              )}
            </div>

            {/* Edit button (always visible, subtle) */}
            <button
              onClick={() => setEditando(produto)}
              aria-label={`Editar ${produto.nome}`}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-800 rounded-full p-1.5 shadow border"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {editando && (
        <EditProdutoModal
          produto={editando}
          categorias={categorias}
          onClose={() => setEditando(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
