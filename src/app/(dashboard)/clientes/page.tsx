import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate, formatPhone } from '@/lib/utils'
import { Users, Plus, Phone } from 'lucide-react'

interface ClientesPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { q } = await searchParams

  const clientes = await prisma.cliente.findMany({
    where: {
      userId: session.user.id,
      ...(q
        ? {
          OR: [
            { nome: { contains: q } },
            { sobrenome: { contains: q } },
            { telefone: { contains: q } },
            { email: { contains: q } },
          ],
        }
        : {}),
    },
    include: {
      _count: { select: { pedidos: true } },
      pedidos: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { nome: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado
            {clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/clientes/novo">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, telefone ou e-mail..."
          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Buscar clientes"
        />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
        {q && (
          <Button asChild variant="ghost">
            <Link href="/clientes">Limpar</Link>
          </Button>
        )}
      </form>

      {clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border bg-card">
          <Users className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="font-semibold text-lg mb-2">
            {q ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {q
              ? 'Tente outro termo de busca.'
              : 'Cadastre seu primeiro cliente para começar a gerenciar pedidos.'}
          </p>
          {!q && (
            <Button asChild>
              <Link href="/clientes/novo">
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Cadastrar Cliente
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Telefone
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                    Pedidos
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                    Último Pedido
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => {
                  const initials = `${cliente.nome[0]}${cliente.sobrenome[0]}`.toUpperCase()
                  return (
                    <tr
                      key={cliente.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-all duration-200"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/clientes/${cliente.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {cliente.nome} {cliente.sobrenome}
                            </Link>
                            {cliente.email && (
                              <p className="text-xs text-muted-foreground">
                                {cliente.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {cliente.telefone ? (
                          <a
                            href={`tel:${cliente.telefone}`}
                            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="h-3 w-3" aria-hidden="true" />
                            {formatPhone(cliente.telefone)}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="font-medium">{cliente._count.pedidos}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {cliente.pedidos[0]
                          ? formatDate(cliente.pedidos[0].createdAt)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/clientes/${cliente.id}`}>Ver</Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
