import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CatalogoGrid from '@/components/catalogo/CatalogoGrid'

interface CatalogoPageProps {
  searchParams: Promise<{ categoria?: string }>
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { categoria } = await searchParams

  const [produtos, categorias] = await Promise.all([
    prisma.produto.findMany({
      where: { userId: session.user.id, ativo: true },
      include: { categoria: true },
      orderBy: { nome: 'asc' },
    }),
    prisma.categoria.findMany({
      where: { userId: session.user.id },
      orderBy: { ordem: 'asc' },
    }),
  ])

  const totalProdutos = await prisma.produto.count({
    where: { userId: session.user.id, ativo: true },
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Catálogo</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {totalProdutos} produto{totalProdutos !== 1 ? 's' : ''} cadastrado{totalProdutos !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/catalogo/novo">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="hidden sm:inline">Novo Produto</span>
            <span className="sm:hidden">Novo</span>
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
              : 'hover:bg-muted border-border'
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
                : 'hover:bg-muted border-border'
            }`}
          >
            {cat.nome}
          </Link>
        ))}
      </div>

      {/* Grid — client component handles editing */}
      <CatalogoGrid
        produtos={produtos}
        categorias={categorias}
        categoriaAtiva={categoria}
      />
    </div>
  )
}
