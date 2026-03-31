import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Package, Plus } from 'lucide-react'

interface CatalogoPageProps {
  searchParams: Promise<{ categoria?: string }>
}

export default async function CatalogoPage({
  searchParams,
}: CatalogoPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { categoria } = await searchParams

  const [produtos, categorias] = await Promise.all([
    prisma.produto.findMany({
      where: {
        userId: session.user.id,
        ativo: true,
        ...(categoria ? { categoriaId: categoria } : {}),
      },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    }),
    prisma.categoria.findMany({
      where: { userId: session.user.id },
      orderBy: { ordem: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Catálogo</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {produtos.length} produto{produtos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/catalogo/novo">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Novo Produto
          </Link>
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/catalogo"
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            !categoria
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:bg-muted'
          }`}
        >
          Todos
        </Link>
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalogo?categoria=${cat.id}`}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              categoria === cat.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-muted'
            }`}
          >
            {cat.nome}
          </Link>
        ))}
      </div>

      {produtos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border bg-card">
          <Package className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="font-semibold text-lg mb-2">
            {categoria ? 'Nenhum produto nesta categoria' : 'Nenhum produto ainda'}
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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-muted flex items-center justify-center">
                {produto.imagem ? (
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm leading-tight">{produto.nome}</p>
                {produto.categoria && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {produto.categoria.nome}
                  </p>
                )}
                <p className="font-bold text-primary mt-1">
                  {formatCurrency(produto.preco)}
                </p>
                {produto.tempoProducao && (
                  <p className="text-xs text-muted-foreground">
                    {produto.tempoProducao}h de produção
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
