import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando seed...')

  const user = await prisma.user.upsert({
    where: { email: 'demo@confeitflow.com' },
    update: {
      password: 'senha123',
    },
    create: {
      name: 'Maria Doceira',
      email: 'demo@confeitflow.com',
      password: 'senha123',
      atelieName: 'Ateliê da Maria',
    },
  })

  console.log('Usuário criado:', user.email)

  const categorias = [
    'Bolos Decorados',
    'Ovos de Colher',
    'Brigadeiros e Docinhos',
    'Tortas e Cheesecakes',
    'Brownies e Cookies',
    'Kits e Cestas',
  ]

  const createdCategorias = []
  for (let i = 0; i < categorias.length; i++) {
    const cat = await prisma.categoria.upsert({
      where: { id: `cat-seed-${i}` },
      update: {},
      create: {
        id: `cat-seed-${i}`,
        nome: categorias[i],
        ordem: i,
        userId: user.id,
      },
    })
    createdCategorias.push(cat)
  }

  console.log('Categorias criadas:', createdCategorias.length)

  const produtosData = [
    {
      id: 'prod-seed-1',
      nome: 'Bolo de Morango com Chantilly',
      preco: 180,
      custoEstimado: 60,
      tempoProducao: 6,
      descricao: 'Bolo de baunilha recheado com morangos e chantilly',
      categoriaIdx: 0,
    },
    {
      id: 'prod-seed-2',
      nome: 'Ovo de Colher Nutella',
      preco: 85,
      custoEstimado: 30,
      tempoProducao: 4,
      descricao: 'Ovo de colher recheado com Nutella artesanal',
      categoriaIdx: 1,
    },
    {
      id: 'prod-seed-3',
      nome: 'Caixa de Brigadeiros (20 un)',
      preco: 60,
      custoEstimado: 20,
      tempoProducao: 2,
      descricao: 'Brigadeiros tradicionais e variações gourmet',
      categoriaIdx: 2,
    },
  ]

  for (const p of produtosData) {
    await prisma.produto.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        nome: p.nome,
        preco: p.preco,
        custoEstimado: p.custoEstimado,
        tempoProducao: p.tempoProducao,
        descricao: p.descricao,
        categoriaId: createdCategorias[p.categoriaIdx].id,
        userId: user.id,
      },
    })
  }

  console.log('Produtos criados:', produtosData.length)

  await prisma.cliente.upsert({
    where: { id: 'cliente-seed-1' },
    update: {},
    create: {
      id: 'cliente-seed-1',
      nome: 'Ana',
      sobrenome: 'Santos',
      telefone: '11999999999',
      email: 'ana@exemplo.com',
      cidade: 'São Paulo',
      userId: user.id,
    },
  })

  console.log('Cliente seed criado')
  console.log('Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
