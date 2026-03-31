import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { UpdatePedidoButton } from '@/components/pedidos/UpdatePedidoButton'
import {
  formatDate,
  formatCurrency,
  statusLabel,
  pagamentoLabel,
  progressoParaStatus,
  whatsappLink,
} from '@/lib/utils'
import {
  ArrowLeft,
  MessageCircle,
  User,
  Package,
  Truck,
  CreditCard,
  Clock,
} from 'lucide-react'

interface PedidoDetailPageProps {
  params: Promise<{ id: string }>
}

const STATUS_FLOW = [
  'RECEBIDO',
  'CONFIRMADO',
  'EM_PRODUCAO',
  'DECORACAO',
  'PRONTO',
  'ENTREGUE',
]

export default async function PedidoDetailPage({
  params,
}: PedidoDetailPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const pedido = await prisma.pedido.findUnique({
    where: { id, userId: session.user.id },
    include: {
      cliente: true,
      itens: {
        include: { produto: true },
      },
      historico: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!pedido) notFound()

  const currentStatusIndex = STATUS_FLOW.indexOf(pedido.status)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" aria-label="Voltar para pedidos">
            <Link href="/pedidos">
              <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              Voltar
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Pedido #{pedido.numero}</h2>
              <StatusBadge status={pedido.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Criado em {formatDate(pedido.dataPedido)}
            </p>
          </div>
        </div>

        {pedido.cliente && (
          <Button asChild variant="outline" size="sm">
            <a
              href={whatsappLink(
                pedido.cliente.telefone,
                `Olá ${pedido.cliente.nome}, seu pedido #${pedido.numero} está sendo preparado com carinho!`
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviar mensagem no WhatsApp"
            >
              <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
              WhatsApp
            </a>
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {pedido.status !== 'CANCELADO' && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex justify-between mb-2 hidden md:flex">
            {STATUS_FLOW.map((s, i) => (
              <div
                key={s}
                className={`text-xs font-medium ${i <= currentStatusIndex
                  ? 'text-primary'
                  : 'text-muted-foreground'
                  }`}
              >
                {statusLabel(s).split(' ')[0]}
              </div>
            ))}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${pedido.progresso}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm font-medium">
              {pedido.progresso}% concluído
            </p>
            <UpdatePedidoButton
              pedido={{
                id: pedido.id,
                numero: pedido.numero,
                status: pedido.status,
                progresso: pedido.progresso,
              }}
              variant="secondary"
              size="sm"
            />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" aria-hidden="true" />
                Itens do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pedido.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.produto.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantidade}x{' '}
                        {formatCurrency(item.precoUnitario)}
                        {item.personalizacao && ` — ${item.personalizacao}`}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(pedido.valorTotal - pedido.taxaEntrega)}</span>
                </div>
                {pedido.taxaEntrega > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de entrega</span>
                    <span>{formatCurrency(pedido.taxaEntrega)}</span>
                  </div>
                )}
                {pedido.desconto > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto</span>
                    <span className="text-destructive">
                      -{formatCurrency(pedido.desconto)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(pedido.valorFinal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          {(pedido.especificacoes || pedido.observacoesInternas) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Especificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pedido.especificacoes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Detalhes do pedido
                    </p>
                    <p className="text-sm">{pedido.especificacoes}</p>
                  </div>
                )}
                {pedido.observacoesInternas && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Observações internas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pedido.observacoesInternas}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {pedido.historico.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {pedido.historico.map((h) => (
                    <li key={h.id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="font-medium">{h.acao}</p>
                        {h.detalhes && (
                          <p className="text-muted-foreground text-xs">
                            {h.detalhes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(h.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" aria-hidden="true" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pedido.cliente ? (
                <>
                  <Link
                    href={`/clientes/${pedido.cliente.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {pedido.cliente.nome} {pedido.cliente.sobrenome}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pedido.cliente.telefone}
                  </p>
                  {pedido.cliente.email && (
                    <p className="text-sm text-muted-foreground">
                      {pedido.cliente.email}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sem cliente vinculado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" aria-hidden="true" />
                Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">{formatDate(pedido.dataEntrega)}</span>
              </div>
              {pedido.horaEntrega && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora</span>
                  <span>{pedido.horaEntrega}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>
                  {pedido.tipoEntrega === 'RETIRADA'
                    ? 'Retirada'
                    : pedido.tipoEntrega === 'ENTREGA'
                      ? 'Entrega'
                      : 'Envio'}
                </span>
              </div>
              {pedido.enderecoEntrega && (
                <div>
                  <span className="text-muted-foreground">Endereço</span>
                  <p className="mt-0.5">{pedido.enderecoEntrega}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge
                  status={pedido.statusPagamento}
                  type="pagamento"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">{formatCurrency(pedido.valorFinal)}</span>
              </div>
              {pedido.valorPago > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago</span>
                  <span className="text-green-600">
                    {formatCurrency(pedido.valorPago)}
                  </span>
                </div>
              )}
              {pedido.valorFinal - pedido.valorPago > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Restante</span>
                  <span className="text-destructive font-medium">
                    {formatCurrency(pedido.valorFinal - pedido.valorPago)}
                  </span>
                </div>
              )}
              {pedido.formaPagamento && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Forma</span>
                  <span>{pedido.formaPagamento}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
