import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  formatDate,
  formatPhone,
  formatCurrency,
  whatsappLink,
} from '@/lib/utils'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  ShoppingBag,
} from 'lucide-react'

interface ClienteDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClienteDetailPage({
  params,
}: ClienteDetailPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const cliente = await prisma.cliente.findUnique({
    where: { id, userId: session.user.id },
    include: {
      pedidos: {
        orderBy: { createdAt: 'desc' },
        include: {
          itens: {
            include: { produto: { select: { nome: true } } },
          },
        },
      },
    },
  })

  if (!cliente) notFound()

  const totalGasto = cliente.pedidos
    .filter((p) => p.status !== 'CANCELADO')
    .reduce((sum, p) => sum + p.valorFinal, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" aria-label="Voltar para clientes">
            <Link href="/clientes">
              <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              Voltar
            </Link>
          </Button>
          <h2 className="text-2xl font-bold">
            {cliente.nome} {cliente.sobrenome}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a
              href={whatsappLink(
                cliente.telefone,
                `Olá, ${cliente.nome}! Tudo bem?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviar mensagem no WhatsApp"
            >
              <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
              WhatsApp
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href={`/pedidos/novo?clienteId=${cliente.id}`}>
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Novo Pedido
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
        <Card className="md:col-span-1 border-0 shadow-soft glass hover-lift overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <a
                  href={`tel:${cliente.telefone}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {formatPhone(cliente.telefone)}
                </a>
              </div>
            </div>

            {cliente.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <a
                    href={`mailto:${cliente.email}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {cliente.email}
                  </a>
                </div>
              </div>
            )}

            {cliente.cpf && (
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 flex items-center justify-center font-bold text-[10px]">CPF</div>
                <div>
                  <p className="text-sm font-medium">CPF</p>
                  <p className="text-sm text-muted-foreground">
                    {cliente.cpf}
                  </p>
                </div>
              </div>
            )}

            {cliente.dataNascimento && (
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 flex items-center justify-center font-bold text-[10px]">DT</div>
                <div>
                  <p className="text-sm font-medium">Data de Nascimento</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(cliente.dataNascimento)}
                  </p>
                </div>
              </div>
            )}

            {(cliente.endereco || cliente.bairro || cliente.cidade) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">
                    {[cliente.endereco, cliente.bairro, cliente.cidade]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}

            {cliente.observacoes && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-1">Observações</p>
                <p className="text-sm text-muted-foreground">
                  {cliente.observacoes}
                </p>
              </div>
            )}

            <div className="pt-2 border-t grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Pedidos</p>
                <p className="text-lg font-bold">{cliente.pedidos.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total gasto</p>
                <p className="text-lg font-bold">
                  {formatCurrency(totalGasto)}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                Cliente desde {formatDate(cliente.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Pedidos</h3>
          </div>

          {cliente.pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border bg-card">
              <ShoppingBag
                className="h-10 w-10 text-muted-foreground mb-3"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-sm">
                Este cliente ainda não tem pedidos
              </p>
              <Button asChild size="sm" className="mt-3">
                <Link href={`/pedidos/novo?clienteId=${cliente.id}`}>
                  <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                  Criar Pedido
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cliente.pedidos.map((pedido) => (
                <li key={pedido.id}>
                  <Link
                    href={`/pedidos/${pedido.id}`}
                    className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:bg-muted/50 transition-all duration-200 hover-lift press-scale"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{pedido.numero}</span>
                        <StatusBadge status={pedido.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Entrega: {formatDate(pedido.dataEntrega)} •{' '}
                        {pedido.itens
                          .map((i) => i.produto.nome)
                          .slice(0, 2)
                          .join(', ')}
                        {pedido.itens.length > 2 &&
                          ` +${pedido.itens.length - 2}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(pedido.valorFinal)}
                      </p>
                      <StatusBadge
                        status={pedido.statusPagamento}
                        type="pagamento"
                        className="mt-1"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
