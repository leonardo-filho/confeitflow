'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Cliente {
  id: string
  nome: string
  sobrenome: string
  telefone: string
}

interface Produto {
  id: string
  nome: string
  preco: number
  categoria?: { nome: string } | null
}

interface ItemPedido {
  produtoId: string
  produto: Produto
  quantidade: number
  precoUnitario: number
  personalizacao: string
}

const STEPS = [
  'Cliente (Opcional)',
  'Itens',
  'Entrega',
  'Detalhes',
  'Pagamento',
  'Revisão',
]

export default function NovoPedidoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedClienteId = searchParams.get('clienteId')

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clienteSearch, setClienteSearch] = useState('')

  const [selectedClienteId, setSelectedClienteId] = useState(
    preSelectedClienteId || ''
  )
  const [itens, setItens] = useState<ItemPedido[]>([])
  const [dataEntrega, setDataEntrega] = useState('')
  const [horaEntrega, setHoraEntrega] = useState('')
  const [tipoEntrega, setTipoEntrega] = useState('RETIRADA')
  const [enderecoEntrega, setEnderecoEntrega] = useState('')
  const [taxaEntrega, setTaxaEntrega] = useState(0)
  const [especificacoes, setEspecificacoes] = useState('')
  const [observacoesInternas, setObservacoesInternas] = useState('')
  const [desconto, setDesconto] = useState(0)
  const [formaPagamento, setFormaPagamento] = useState('')
  const [valorPago, setValorPago] = useState(0)
  const [statusPagamento, setStatusPagamento] = useState('PENDENTE')

  const filteredClientes = clientes.filter(
    (c) =>
      !clienteSearch ||
      `${c.nome} ${c.sobrenome}`
        .toLowerCase()
        .includes(clienteSearch.toLowerCase()) ||
      c.telefone.includes(clienteSearch)
  )

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId)

  const subtotal = itens.reduce(
    (sum, i) => sum + i.precoUnitario * i.quantidade,
    0
  )
  const valorTotal = subtotal + taxaEntrega
  const valorFinal = Math.max(0, valorTotal - desconto)

  useEffect(() => {
    fetch('/api/clientes')
      .then((r) => r.json())
      .then(setClientes)
      .catch(() => { })

    fetch('/api/produtos')
      .then((r) => r.json())
      .then(setProdutos)
      .catch(() => { })
  }, [])

  function addItem(produto: Produto) {
    const existing = itens.find((i) => i.produtoId === produto.id)
    if (existing) {
      setItens((prev) =>
        prev.map((i) =>
          i.produtoId === produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      )
    } else {
      setItens((prev) => [
        ...prev,
        {
          produtoId: produto.id,
          produto,
          quantidade: 1,
          precoUnitario: produto.preco,
          personalizacao: '',
        },
      ])
    }
  }

  function removeItem(produtoId: string) {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId))
  }

  function updateItem(
    produtoId: string,
    field: keyof ItemPedido,
    value: number | string
  ) {
    setItens((prev) =>
      prev.map((i) => (i.produtoId === produtoId ? { ...i, [field]: value } : i))
    )
  }

  function canAdvance(): boolean {
    if (step === 1) return itens.length > 0
    if (step === 2) return !!dataEntrega
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: selectedClienteId || null,
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            quantidade: i.quantidade,
            precoUnitario: i.precoUnitario,
            subtotal: i.precoUnitario * i.quantidade,
            personalizacao: i.personalizacao || null,
          })),
          dataEntrega,
          horaEntrega: horaEntrega || null,
          tipoEntrega,
          enderecoEntrega: enderecoEntrega || null,
          taxaEntrega,
          especificacoes: especificacoes || null,
          observacoesInternas: observacoesInternas || null,
          valorTotal,
          desconto,
          valorFinal,
          statusPagamento,
          valorPago,
          formaPagamento: formaPagamento || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao criar pedido')
      }

      const pedido = await res.json()
      toast.success('Pedido criado com sucesso!')
      router.push(`/pedidos/${pedido.id}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao criar pedido'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          aria-label="Voltar para pedidos"
        >
          <Link href="/pedidos">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Novo Pedido</h2>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'
              }`}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        Etapa {step + 1} de {STEPS.length}: {STEPS[step]}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 0: Cliente */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  Selecionar um cliente é <span className="font-medium text-foreground">opcional</span>. Você pode criar o pedido sem vincular a um cliente.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clienteSearch">Buscar cliente</Label>
                <Input
                  id="clienteSearch"
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  placeholder="Nome ou telefone..."
                />
              </div>
              {selectedClienteId && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-sm font-medium">
                    {selectedCliente?.nome} {selectedCliente?.sobrenome}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedClienteId('')}
                    className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Remover
                  </button>
                </div>
              )}
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                {filteredClientes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum cliente encontrado
                  </p>
                ) : (
                  filteredClientes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedClienteId(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedClienteId === c.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                        }`}
                    >
                      <span className="font-medium">
                        {c.nome} {c.sobrenome}
                      </span>
                      <span className="ml-2 opacity-70">{c.telefone}</span>
                    </button>
                  ))
                )}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/clientes/novo">
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Cadastrar novo cliente
                </Link>
              </Button>
            </div>
          )}

          {/* Step 1: Itens */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Produtos do catálogo</p>
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2">
                  {produtos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum produto cadastrado
                    </p>
                  ) : (
                    produtos.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addItem(p)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors flex items-center justify-between"
                      >
                        <span>{p.nome}</span>
                        <span className="font-medium text-muted-foreground">
                          {formatCurrency(p.preco)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {itens.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Itens selecionados</p>
                  {itens.map((item) => (
                    <div
                      key={item.produtoId}
                      className="rounded-md border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {item.produto.nome}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.produtoId)}
                          className="text-destructive hover:text-destructive/80 text-xs"
                          aria-label={`Remover ${item.produto.nome}`}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              item.quantidade > 1
                                ? updateItem(
                                  item.produtoId,
                                  'quantidade',
                                  item.quantidade - 1
                                )
                                : removeItem(item.produtoId)
                            }
                            className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantidade}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(
                                item.produtoId,
                                'quantidade',
                                item.quantidade + 1
                              )
                            }
                            className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`preco-${item.produtoId}`} className="text-xs">
                            Preço unit.
                          </Label>
                          <Input
                            id={`preco-${item.produtoId}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.precoUnitario}
                            onChange={(e) =>
                              updateItem(
                                item.produtoId,
                                'precoUnitario',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Subtotal
                          </p>
                          <p className="text-sm font-semibold">
                            {formatCurrency(
                              item.precoUnitario * item.quantidade
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`pers-${item.produtoId}`} className="text-xs">
                          Personalização
                        </Label>
                        <Input
                          id={`pers-${item.produtoId}`}
                          value={item.personalizacao}
                          onChange={(e) =>
                            updateItem(
                              item.produtoId,
                              'personalizacao',
                              e.target.value
                            )
                          }
                          placeholder="Ex: Sabor chocolate, tema jardim..."
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(subtotal)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Entrega */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataEntrega">Data de entrega *</Label>
                  <Input
                    id="dataEntrega"
                    type="date"
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaEntrega">Hora</Label>
                  <Input
                    id="horaEntrega"
                    type="time"
                    value={horaEntrega}
                    onChange={(e) => setHoraEntrega(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoEntrega">Tipo de entrega</Label>
                <select
                  id="tipoEntrega"
                  value={tipoEntrega}
                  onChange={(e) => setTipoEntrega(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="RETIRADA">Retirada</option>
                  <option value="ENTREGA">Entrega (endereço)</option>
                  <option value="ENVIO">Envio (Correios/transportadora)</option>
                </select>
              </div>

              {tipoEntrega !== 'RETIRADA' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="enderecoEntrega">Endereço de entrega</Label>
                    <Input
                      id="enderecoEntrega"
                      value={enderecoEntrega}
                      onChange={(e) => setEnderecoEntrega(e.target.value)}
                      placeholder="Rua, número, bairro, cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxaEntrega">Taxa de entrega (R$)</Label>
                    <Input
                      id="taxaEntrega"
                      type="number"
                      min="0"
                      step="0.01"
                      value={taxaEntrega}
                      onChange={(e) =>
                        setTaxaEntrega(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Detalhes */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="especificacoes">Especificações do pedido</Label>
                <Textarea
                  id="especificacoes"
                  value={especificacoes}
                  onChange={(e) => setEspecificacoes(e.target.value)}
                  placeholder="Detalhes sobre cores, tema, tamanho, sabores..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoesInternas">
                  Observações internas
                </Label>
                <Textarea
                  id="observacoesInternas"
                  value={observacoesInternas}
                  onChange={(e) => setObservacoesInternas(e.target.value)}
                  placeholder="Notas internas, lembretes..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Pagamento */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {taxaEntrega > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span>{formatCurrency(taxaEntrega)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="text-destructive">
                    -{formatCurrency(desconto)}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(valorFinal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desconto">Desconto (R$)</Label>
                <Input
                  id="desconto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={desconto}
                  onChange={(e) =>
                    setDesconto(parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de pagamento</Label>
                <select
                  id="formaPagamento"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  <option value="PIX">PIX</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_CREDITO">Cartão de crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de débito</option>
                  <option value="TRANSFERENCIA">Transferência bancária</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusPagamento">Status do pagamento</Label>
                <select
                  id="statusPagamento"
                  value={statusPagamento}
                  onChange={(e) => setStatusPagamento(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="SINAL_PAGO">Sinal pago</option>
                  <option value="PAGO">Pago</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorPago">Valor já pago (R$)</Label>
                <Input
                  id="valorPago"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorPago}
                  onChange={(e) =>
                    setValorPago(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          )}

          {/* Step 5: Revisão */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-md border p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Cliente
                  </p>
                  <p className="font-medium">
                    {selectedCliente
                      ? `${selectedCliente.nome} ${selectedCliente.sobrenome}`
                      : 'Sem cliente vinculado'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Itens
                  </p>
                  {itens.map((i) => (
                    <p key={i.produtoId} className="text-sm">
                      {i.quantidade}x {i.produto.nome} —{' '}
                      {formatCurrency(i.precoUnitario * i.quantidade)}
                      {i.personalizacao && (
                        <span className="text-muted-foreground">
                          {' '}
                          ({i.personalizacao})
                        </span>
                      )}
                    </p>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Data de Entrega
                    </p>
                    <p className="text-sm">
                      {dataEntrega
                        ? new Intl.DateTimeFormat('pt-BR').format(
                          new Date(dataEntrega + 'T12:00:00')
                        )
                        : '—'}
                      {horaEntrega && ` às ${horaEntrega}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Tipo
                    </p>
                    <p className="text-sm">
                      {tipoEntrega === 'RETIRADA'
                        ? 'Retirada'
                        : tipoEntrega === 'ENTREGA'
                          ? 'Entrega'
                          : 'Envio'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Pagamento
                  </p>
                  <p className="text-lg font-bold">{formatCurrency(valorFinal)}</p>
                  {desconto > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Desconto: {formatCurrency(desconto)}
                    </p>
                  )}
                  {taxaEntrega > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Taxa de entrega: {formatCurrency(taxaEntrega)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Anterior
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance()}
          >
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4 mr-2" aria-hidden="true" />
            )}
            Criar Pedido
          </Button>
        )}
      </div>
    </div>
  )
}
