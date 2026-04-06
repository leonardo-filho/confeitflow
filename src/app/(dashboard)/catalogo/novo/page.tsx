'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, ImageIcon, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Categoria {
  id: string
  nome: string
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function NovoProdutoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [ativo, setAtivo] = useState(true)
  const [imagem, setImagem] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImg, setUploadingImg] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/categorias')
      .then((r) => r.json())
      .then(setCategorias)
      .catch(() => {})
  }, [])

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome') as string,
      preco: parseFloat(formData.get('preco') as string) || 0,
      categoriaId: (formData.get('categoriaId') as string) || null,
      descricao: (formData.get('descricao') as string) || null,
      custoEstimado: parseFloat(formData.get('custoEstimado') as string) || null,

      ativo,
      imagem,
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
        <Button asChild variant="ghost" size="sm" aria-label="Voltar para catálogo">
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
          <form onSubmit={handleSubmit} className="space-y-5">
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
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
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
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingImg}>
                    <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                    {imagePreview ? 'Trocar foto' : 'Adicionar foto'}
                  </Button>
                  {imagePreview && (
                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={removeImage}>
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

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do produto *</Label>
              <Input id="nome" name="nome" required placeholder="Ex: Bolo de Morango com Chantilly" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço de venda (R$) *</Label>
                <Input id="preco" name="preco" type="number" min="0" step="0.01" required placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custoEstimado">Custo estimado (R$)</Label>
                <Input id="custoEstimado" name="custoEstimado" type="number" min="0" step="0.01" placeholder="0,00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoriaId">Categoria</Label>
              <select
                id="categoriaId"
                name="categoriaId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" name="descricao" placeholder="Descreva o produto, ingredientes, tamanhos disponíveis..." rows={3} />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={ativo}
                aria-label="Produto ativo"
                onClick={() => setAtivo(!ativo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ativo ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${ativo ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <Label className="cursor-pointer">{ativo ? 'Produto ativo' : 'Produto inativo'}</Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
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
