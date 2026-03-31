'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome') as string,
      sobrenome: formData.get('sobrenome') as string,
      telefone: formData.get('telefone') as string,
      email: formData.get('email') as string,
      endereco: formData.get('endereco') as string,
      bairro: formData.get('bairro') as string,
      cidade: formData.get('cidade') as string,
      observacoes: formData.get('observacoes') as string,
    }

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao criar cliente')
      }

      toast.success('Cliente cadastrado com sucesso!')
      router.push('/clientes')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" aria-label="Voltar para clientes">
          <Link href="/clientes">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Novo Cliente</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  name="nome"
                  required
                  placeholder="Maria"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome *</Label>
                <Input
                  id="sobrenome"
                  name="sobrenome"
                  required
                  placeholder="Silva"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
              <Input
                id="telefone"
                name="telefone"
                required
                placeholder="(11) 99999-9999"
                type="tel"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="cliente@exemplo.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                name="endereco"
                placeholder="Rua, número, complemento"
                autoComplete="street-address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  placeholder="Centro"
                  autoComplete="address-level3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  placeholder="São Paulo"
                  autoComplete="address-level2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                placeholder="Preferências, alergias, etc."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                )}
                Salvar Cliente
              </Button>
              <Button asChild variant="outline">
                <Link href="/clientes">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
