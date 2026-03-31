# PRD — ConfeitFlow

## Sistema de Gestão para Ateliê de Doceria

**Versão:** 1.0
**Data:** 2026-03-30
**Autor:** Leonardo Rodrigues do Nascimento Filho
**Stack sugerida:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Shadcn/UI + Prisma ORM + SQLite (dev) / PostgreSQL (prod) + NextAuth.js v5
**Skills aplicadas:** `vercel-react-best-practices` + `web-design-guidelines` (Vercel Labs)

---

## 1. Visão Geral

### 1.1 O que é o ConfeitFlow?

ConfeitFlow é um sistema de gestão web para ateliês de doceria e confeitaria artesanal. Ele centraliza o controle de clientes, pedidos, catálogo de produtos, progresso de produção e calendário de entregas em uma única plataforma. Foi pensado para confeiteiros que trabalham sozinhos ou em pequenas equipes e precisam parar de depender de cadernos, WhatsApp e planilhas soltas.

### 1.2 Problema

- Pedidos anotados em cadernos/WhatsApp se perdem ou ficam desorganizados.
- Não existe visão clara de "o que preciso produzir hoje/amanhã/essa semana".
- Dificuldade em acompanhar o progresso de cada encomenda (recebido → em produção → pronto → entregue).
- Dados de clientes ficam espalhados, dificultando recontato e fidelização.
- Sem controle financeiro mínimo, é difícil saber se o ateliê está lucrativo.
- Escalar para vendas online exige retrabalho total se não houver base digital.

### 1.3 Solução

Uma aplicação web responsiva (mobile-first) que permite:

1. Cadastrar e gerenciar clientes com histórico completo.
2. Criar pedidos com especificações detalhadas e data de entrega.
3. Acompanhar o progresso de produção de cada pedido em um pipeline visual (kanban).
4. Visualizar todas as entregas em um calendário.
5. Manter um catálogo de produtos com preços e fotos.
6. Ter um dashboard com métricas do ateliê.
7. (Futuro) Expor o catálogo como vitrine online para receber pedidos de clientes.

### 1.4 Público-alvo

- Confeiteiros artesanais e donos de ateliês de doceria.
- Pequenos negócios de doces sob encomenda (ovos de colher, bolos, brigadeiros, tortas).
- Operação de 1 a 5 pessoas.

---

## 2. Arquitetura Técnica

### 2.1 Stack

| Camada         | Tecnologia                          | Justificativa                                    |
| -------------- | ----------------------------------- | ------------------------------------------------ |
| Frontend       | Next.js 14 (App Router) + React 18  | SSR, rotas de API integradas, deploy fácil        |
| Estilização    | Tailwind CSS + shadcn/ui            | Componentes prontos, design system consistente    |
| Linguagem      | TypeScript                          | Tipagem forte, menos bugs                        |
| ORM            | Prisma                              | Type-safe, migrations, suporta SQLite e Postgres  |
| Banco (dev)    | SQLite                              | Zero config para desenvolvimento local            |
| Banco (prod)   | PostgreSQL (Supabase ou Neon)       | Escalável, gratuito em tier free                  |
| Auth           | NextAuth.js (Auth.js v5)            | Login com email/senha ou Google OAuth             |
| Upload de imgs | Cloudinary ou UploadThing           | CDN de imagens para produtos e pedidos            |
| Deploy         | Vercel                              | Deploy automático via Git, domínio grátis         |
| State          | React Context + TanStack Query      | Cache de dados server, estado local simples       |
| Validação      | Zod + React Hook Form               | Type-safe, mensagens de erro inline               |
| Drag & Drop    | @dnd-kit/core                       | Acessível, suporta teclado e touch                |

### 2.2 Estrutura de Pastas

```
confeitflow/
├── prisma/
│   └── schema.prisma
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Sidebar + Header
│   │   │   ├── page.tsx                # Dashboard principal
│   │   │   ├── clientes/
│   │   │   │   ├── page.tsx            # Lista de clientes
│   │   │   │   ├── [id]/page.tsx       # Detalhe do cliente
│   │   │   │   └── novo/page.tsx       # Cadastro de cliente
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx            # Lista/Kanban de pedidos
│   │   │   │   ├── [id]/page.tsx       # Detalhe do pedido
│   │   │   │   └── novo/page.tsx       # Novo pedido
│   │   │   ├── catalogo/
│   │   │   │   ├── page.tsx            # Catálogo de produtos
│   │   │   │   └── [id]/page.tsx       # Detalhe/edição do produto
│   │   │   ├── calendario/
│   │   │   │   └── page.tsx            # Calendário de entregas
│   │   │   ├── financeiro/
│   │   │   │   └── page.tsx            # Resumo financeiro
│   │   │   └── configuracoes/
│   │   │       └── page.tsx            # Perfil do ateliê, config
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── clientes/route.ts
│   │   │   ├── pedidos/route.ts
│   │   │   ├── produtos/route.ts
│   │   │   ├── dashboard/route.ts
│   │   │   └── upload/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── UpcomingDeliveries.tsx
│   │   │   └── RevenueChart.tsx
│   │   ├── pedidos/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanCard.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── OrderTimeline.tsx
│   │   ├── clientes/
│   │   │   ├── ClienteForm.tsx
│   │   │   └── ClienteCard.tsx
│   │   └── catalogo/
│   │       ├── ProdutoForm.tsx
│   │       └── ProdutoCard.tsx
│   ├── lib/
│   │   ├── prisma.ts                   # Prisma client singleton
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── utils.ts                    # Helpers (formatDate, currency, etc)
│   │   └── validations.ts             # Zod schemas
│   ├── hooks/
│   │   ├── useClientes.ts
│   │   ├── usePedidos.ts
│   │   └── useDashboard.ts
│   └── types/
│       └── index.ts                    # Tipos globais (se precisar além do Prisma)
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

### 2.3 Padrões de Performance (Vercel React Best Practices)

Regras **críticas** que devem ser seguidas durante o desenvolvimento:

#### Eliminar Waterfalls (CRÍTICO)
- Usar `Promise.all()` para fetches independentes em Server Components
- Iniciar promises cedo, fazer `await` tarde em API routes
- Usar `<Suspense>` com `loading.tsx` para streaming de conteúdo por seção
- Exemplo no Dashboard: buscar métricas, próximas entregas e gráfico em paralelo

```tsx
// ✅ Correto — paralelo
const [metricas, entregas, grafico] = await Promise.all([
  getMetricas(userId),
  getProximasEntregas(userId),
  getDadosGrafico(userId),
])

// ❌ Errado — waterfall
const metricas = await getMetricas(userId)
const entregas = await getProximasEntregas(userId)
```

#### Bundle Size (CRÍTICO)
- Usar `next/dynamic` para componentes pesados: `KanbanBoard`, `RevenueChart`, calendário
- Carregar `recharts` e `react-big-calendar` apenas quando a rota é acessada
- Importar diretamente dos pacotes (sem barrel files)

```tsx
// ✅ Correto
const KanbanBoard = dynamic(() => import('@/components/pedidos/KanbanBoard'), {
  loading: () => <KanbanSkeleton />,
})
```

#### Server Components (ALTO IMPACTO)
- Todas as páginas de listagem (`/clientes`, `/pedidos`, `/catalogo`) devem ser Server Components
- Usar `React.cache()` para deduplicar queries na mesma requisição
- Passar apenas dados serializáveis para Client Components (sem instâncias Prisma)
- Hoist de dados estáticos (ex: categorias) ao nível de módulo

#### Re-renders (MÉDIO)
- Usar `useTransition` para mudanças de status no Kanban (evita UI travada)
- `useDeferredValue` no campo de busca de clientes
- Não definir componentes dentro de componentes (ex: cards do Kanban)
- `useRef` para valores transitórios (ex: drag position)

---

## 3. Modelagem de Dados (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"       // Trocar para "postgresql" em produção
  url      = env("DATABASE_URL")
}

// ============================================================
// AUTH
// ============================================================

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String?   // hash bcrypt (null se usar OAuth)
  image         String?
  atelieName    String?   // Nome do ateliê (ex: "Doces da Gi")
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  clientes      Cliente[]
  pedidos       Pedido[]
  produtos      Produto[]
  categorias    Categoria[]
}

// ============================================================
// CLIENTES
// ============================================================

model Cliente {
  id            String    @id @default(cuid())
  nome          String
  sobrenome     String
  telefone      String    // WhatsApp é essencial
  email         String?
  endereco      String?
  bairro        String?
  cidade        String?
  referencia    String?   // Ponto de referência para entrega
  cpf           String?
  dataNascimento DateTime?
  observacoes   String?   // Alergias, preferências, restrições
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  userId        String
  user          User      @relation(fields: [userId], references: [id])
  pedidos       Pedido[]

  @@index([userId])
  @@index([nome, sobrenome])
}

// ============================================================
// CATÁLOGO DE PRODUTOS
// ============================================================

model Categoria {
  id            String    @id @default(cuid())
  nome          String    // "Bolos", "Ovos de Colher", "Brigadeiros", "Tortas"
  descricao     String?
  ordem         Int       @default(0)

  userId        String
  user          User      @relation(fields: [userId], references: [id])
  produtos      Produto[]

  @@index([userId])
}

model Produto {
  id            String    @id @default(cuid())
  nome          String    // "Ovo de Colher Ninho c/ Nutella"
  descricao     String?
  preco         Float     // Preço base
  custoEstimado Float?    // Custo estimado de ingredientes
  tempoProducao Int?      // Tempo médio de produção em minutos
  imagem        String?   // URL da imagem (Cloudinary)
  ativo         Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  categoriaId   String?
  categoria     Categoria? @relation(fields: [categoriaId], references: [id])
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  itensPedido   ItemPedido[]

  @@index([userId])
  @@index([categoriaId])
}

// ============================================================
// PEDIDOS
// ============================================================

enum StatusPedido {
  RECEBIDO          // Pedido registrado, aguardando confirmação
  CONFIRMADO        // Cliente confirmou e/ou pagou sinal
  EM_PRODUCAO       // Produção iniciada
  DECORACAO         // Fase de decoração/acabamento
  PRONTO            // Finalizado, aguardando entrega/retirada
  ENTREGUE          // Entregue ao cliente
  CANCELADO         // Pedido cancelado
}

enum TipoEntrega {
  RETIRADA          // Cliente retira no ateliê
  ENTREGA           // Entrega no endereço do cliente
  ENVIO             // Envio por transportadora (futuro)
}

enum StatusPagamento {
  PENDENTE          // Nenhum pagamento recebido
  SINAL_PAGO        // Sinal/adiantamento recebido
  PAGO              // Pagamento completo
  REEMBOLSADO       // Devolvido
}

model Pedido {
  id                String          @id @default(cuid())
  numero            Int             @default(autoincrement()) // #001, #002...
  status            StatusPedido    @default(RECEBIDO)
  
  // Datas
  dataPedido        DateTime        @default(now())
  dataEntrega       DateTime        // Data prometida de entrega
  horaEntrega       String?         // "14:00" - horário combinado
  dataProducao      DateTime?       // Quando iniciar a produção
  
  // Entrega
  tipoEntrega       TipoEntrega     @default(RETIRADA)
  enderecoEntrega   String?         // Se diferente do endereço do cliente
  taxaEntrega       Float           @default(0)
  
  // Financeiro
  valorTotal        Float           // Soma dos itens + taxa de entrega
  desconto          Float           @default(0)
  valorFinal        Float           // valorTotal - desconto
  statusPagamento   StatusPagamento @default(PENDENTE)
  valorPago         Float           @default(0)
  formaPagamento    String?         // "PIX", "Dinheiro", "Cartão", "Transferência"
  
  // Detalhes
  especificacoes    String?         // Texto livre: detalhes, tema, cores, referências
  observacoesInternas String?       // Notas internas (cliente não vê)
  imagemReferencia  String?         // URL de foto de referência enviada pelo cliente
  
  // Progresso (0 a 100)
  progresso         Int             @default(0)
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  clienteId         String
  cliente           Cliente         @relation(fields: [clienteId], references: [id])
  userId            String
  user              User            @relation(fields: [userId], references: [id])
  itens             ItemPedido[]
  historico         HistoricoPedido[]

  @@index([userId])
  @@index([clienteId])
  @@index([status])
  @@index([dataEntrega])
}

model ItemPedido {
  id            String    @id @default(cuid())
  quantidade    Int       @default(1)
  precoUnitario Float
  subtotal      Float     // quantidade * precoUnitario
  personalizacao String?  // "Cobertura extra de Nutella", "Sem lactose"

  pedidoId      String
  pedido        Pedido    @relation(fields: [pedidoId], references: [id], onDelete: Cascade)
  produtoId     String
  produto       Produto   @relation(fields: [produtoId], references: [id])

  @@index([pedidoId])
}

// ============================================================
// HISTÓRICO / TIMELINE DO PEDIDO
// ============================================================

model HistoricoPedido {
  id            String    @id @default(cuid())
  acao          String    // "Status alterado para EM_PRODUCAO"
  detalhes      String?   // Detalhes adicionais
  createdAt     DateTime  @default(now())

  pedidoId      String
  pedido        Pedido    @relation(fields: [pedidoId], references: [id], onDelete: Cascade)

  @@index([pedidoId])
}
```

---

## 4. Funcionalidades Detalhadas

### 4.1 Dashboard (Página Inicial)

O dashboard é a primeira tela após login. Objetivo: saber em 5 segundos o estado do ateliê.

**Cards de métricas (topo):**

| Card                    | Cálculo                                              |
| ----------------------- | ---------------------------------------------------- |
| Pedidos Ativos          | COUNT pedidos WHERE status NOT IN (ENTREGUE, CANCELADO) |
| Entregas Hoje           | COUNT pedidos WHERE dataEntrega = hoje                |
| Entregas Esta Semana    | COUNT pedidos WHERE dataEntrega BETWEEN seg e dom     |
| Faturamento do Mês      | SUM valorFinal WHERE dataPedido no mês corrente AND status != CANCELADO |

**Seções do dashboard:**

1. **Próximas Entregas** — Lista dos próximos 5 pedidos por data de entrega, com nome do cliente, produto e status.
2. **Pedidos que Precisam de Atenção** — Pedidos com dataEntrega próxima (< 48h) e status ainda em RECEBIDO ou CONFIRMADO (alerta de atraso).
3. **Gráfico de Faturamento** — Gráfico de barras com faturamento dos últimos 6 meses (recharts).
4. **Ações Rápidas** — Botões "Novo Pedido" e "Novo Cliente".

### 4.2 Gestão de Clientes

**Lista de Clientes (`/clientes`):**
- Tabela com busca por nome/telefone.
- Colunas: Nome Completo, Telefone, Qtd Pedidos, Último Pedido, Ações.
- Botão "Novo Cliente".
- Ordenação por nome ou data de último pedido.

**Detalhe do Cliente (`/clientes/[id]`):**
- Dados pessoais completos.
- Histórico de todos os pedidos desse cliente (com status e valor).
- Total gasto pelo cliente (lifetime value).
- Botão "Novo Pedido para este Cliente" (preenche o clienteId automaticamente).
- Botão para abrir conversa no WhatsApp (link `https://wa.me/55{telefone}`).

**Formulário de Cliente:**
- Campos obrigatórios: nome, sobrenome, telefone.
- Campos opcionais: email, endereço completo, CPF, data de nascimento, observações.
- Validação com Zod.
- Máscara no telefone: (XX) XXXXX-XXXX.

### 4.3 Gestão de Pedidos

Esta é a funcionalidade central do sistema.

**Visualizações disponíveis (`/pedidos`):**

1. **Kanban (padrão)** — Colunas por status:
   - RECEBIDO → CONFIRMADO → EM_PRODUÇÃO → DECORAÇÃO → PRONTO → ENTREGUE
   - Drag-and-drop para mover cards entre colunas.
   - Cada card mostra: número do pedido, nome do cliente, produto principal, data de entrega, barra de progresso.
   - Cards com entrega em < 24h ganham borda vermelha.
   - Cards com entrega em < 48h ganham borda amarela.

2. **Lista** — Tabela com filtros por status, data de entrega, cliente.
   - Colunas: #, Cliente, Produtos, Entrega, Status, Progresso, Valor, Ações.

**Detalhe do Pedido (`/pedidos/[id]`):**

Layout em 2 colunas (desktop) / stack (mobile):

**Coluna esquerda:**
- Status atual (badge colorido) com botões para avançar/retroceder status.
- Barra de progresso visual (0-100%) com input para ajustar manualmente.
- Timeline/Histórico de mudanças (HistoricoPedido).

**Coluna direita:**
- Dados do cliente (nome, telefone com link WhatsApp).
- Data e hora de entrega.
- Tipo de entrega (retirada/entrega).
- Lista de itens do pedido com quantidades e preços.
- Especificações e observações.
- Imagem de referência (se houver).
- Resumo financeiro: subtotal, desconto, taxa de entrega, total, valor pago, saldo restante.
- Status do pagamento com botão para registrar pagamento.

**Formulário de Novo Pedido:**

Step 1 — Cliente:
- Busca por cliente existente (autocomplete por nome/telefone).
- Ou botão "Cadastrar Novo Cliente" (modal).

Step 2 — Itens:
- Selecionar produtos do catálogo.
- Definir quantidade de cada item.
- Campo de personalização por item.
- Preço unitário preenchido automaticamente (editável).

Step 3 — Entrega:
- Data de entrega (datepicker, não permitir datas passadas).
- Horário de entrega.
- Tipo: retirada ou entrega.
- Se entrega: endereço (preenche do cliente ou personalizado) + taxa.

Step 4 — Detalhes:
- Especificações gerais (textarea rico).
- Upload de imagem de referência.
- Observações internas.

Step 5 — Pagamento:
- Valor total calculado automaticamente.
- Campo de desconto (R$ ou %).
- Valor final.
- Forma de pagamento.
- Valor pago agora (sinal ou total).

Step 6 — Revisão e confirmação.

### 4.4 Catálogo de Produtos

**Lista de Produtos (`/catalogo`):**
- Grid de cards com foto, nome, categoria, preço.
- Filtro por categoria.
- Toggle para mostrar/ocultar inativos.
- Botão "Novo Produto".

**Formulário de Produto:**
- Nome (obrigatório).
- Descrição.
- Categoria (select com opção de criar nova).
- Preço (obrigatório).
- Custo estimado (para cálculo de margem).
- Tempo médio de produção (minutos).
- Upload de imagem.
- Ativo (toggle).

**Categorias sugeridas (seed inicial):**
- Bolos Decorados
- Ovos de Colher
- Brigadeiros e Docinhos
- Tortas e Cheesecakes
- Brownies e Cookies
- Kits e Cestas

### 4.5 Calendário de Entregas

**Visão (`/calendario`):**
- Calendário mensal interativo (pode usar react-big-calendar ou fullcalendar).
- Cada entrega aparece como um bloco no dia correspondente.
- Cor do bloco reflete o status (verde = pronto, amarelo = em produção, vermelho = atrasado).
- Click no bloco abre o detalhe do pedido.
- Navegação entre meses.
- Visão semanal e diária disponíveis.

### 4.6 Financeiro (Básico)

**Visão (`/financeiro`):**
- Faturamento do mês atual vs mês anterior.
- Total de pedidos vs pedidos pagos vs pendentes.
- Ticket médio.
- Gráfico de faturamento mensal (últimos 12 meses).
- Lista de pagamentos pendentes (pedidos com statusPagamento != PAGO).
- Margem média (se custoEstimado preenchido nos produtos).

### 4.7 Configurações

- Dados do perfil e do ateliê (nome, logo, telefone, endereço).
- Horário de funcionamento.
- Mensagem padrão para WhatsApp (template de confirmação de pedido).
- Categorias de produtos (CRUD).

---

## 5. Regras de Negócio

### 5.1 Progresso Automático

Quando o status do pedido muda, o progresso é atualizado automaticamente:

| Status       | Progresso |
| ------------ | --------- |
| RECEBIDO     | 0%        |
| CONFIRMADO   | 15%       |
| EM_PRODUCAO  | 40%       |
| DECORACAO    | 70%       |
| PRONTO       | 90%       |
| ENTREGUE     | 100%      |
| CANCELADO    | 0%        |

O usuário pode ajustar manualmente o progresso dentro de cada faixa.

### 5.2 Alertas Visuais

- **Vermelho:** Entrega em menos de 24h e status não é PRONTO nem ENTREGUE.
- **Amarelo:** Entrega em menos de 48h e status é RECEBIDO ou CONFIRMADO.
- **Verde:** Pedido marcado como PRONTO, aguardando entrega.

### 5.3 Número do Pedido

- Autoincrement por usuário/ateliê.
- Exibido como `#001`, `#002`, etc.
- Usado para comunicação com o cliente.

### 5.4 Cálculo Financeiro

```
subtotalItens = SUM(quantidade * precoUnitario) para cada ItemPedido
valorTotal = subtotalItens + taxaEntrega
valorFinal = valorTotal - desconto
saldoDevedor = valorFinal - valorPago
```

### 5.5 Soft Delete

- Clientes e produtos nunca são deletados do banco (apenas desativados com `ativo = false`).
- Pedidos cancelados permanecem no histórico.

---

## 6. UI/UX

### 6.1 Design System

- **Paleta primária:** Tons quentes e acolhedores (rosa/salmon #F4845F, marrom chocolate #5C3D2E, creme #FFF8F0).
- **Paleta de status:** Verde (#22C55E), Amarelo (#EAB308), Vermelho (#EF4444), Azul (#3B82F6), Cinza (#6B7280).
- **Tipografia:** Inter (UI) + Playfair Display (headings decorativos, logo).
- **Cantos:** Arredondados (border-radius: 12px para cards).
- **Sombras:** Suaves, estilo soft UI.
- **Ícones:** Lucide React.

### 6.2 Responsividade

- **Mobile (< 768px):** Menu bottom navigation com 4 itens (Dashboard, Pedidos, Calendário, Mais). Kanban scroll horizontal.
- **Tablet (768-1024px):** Sidebar colapsável.
- **Desktop (> 1024px):** Sidebar fixa expandida.

### 6.3 Componentes-chave

| Componente          | Comportamento                                               |
| ------------------- | ----------------------------------------------------------- |
| KanbanBoard         | Drag-and-drop com @dnd-kit/core. Atualiza status via API.   |
| ProgressBar         | Barra animada com porcentagem. Click abre slider.           |
| DeliveryCountdown   | Mostra "Entrega em 2 dias" ou "HOJE" ou "ATRASADO".         |
| WhatsAppButton      | Abre wa.me com mensagem pré-formatada.                       |
| StatusBadge         | Badge colorido por status com ícone.                         |
| MoneyInput          | Input formatado em BRL (R$ 150,00).                          |
| PhoneInput          | Máscara (XX) XXXXX-XXXX.                                    |

### 6.4 Diretrizes de Acessibilidade (Web Interface Guidelines)

Todos os componentes devem estar em conformidade:

#### Controles Interativos
- Botões de ícone (ex: editar, deletar, fechar modal) **obrigatoriamente** com `aria-label`
- Ícones decorativos com `aria-hidden="true"` (Lucide icons)
- Todo `<input>` com `<label>` associado via `htmlFor` ou `aria-label`
- Elementos interativos devem suportar teclado (`onKeyDown` para Enter/Space)
- Nunca usar `onClick` em `<div>` — sempre `<button>` ou `<a>`

#### Foco e Navegação
- Focus indicator visível em todos os elementos: classe `focus-visible:ring-2 focus-visible:ring-primary`
- Nunca usar `outline-none` sem substituição visual
- Usar `:focus-visible` em vez de `:focus`
- Hierarquia de headings respeitada (`<h1>` → `<h2>` → `<h3>`)
- `scroll-margin-top` em âncoras de seção

#### Formulários
- Inputs com `autocomplete` adequado (ex: `autocomplete="name"`, `"tel"`, `"email"`)
- Não bloquear `paste` em campos de telefone/CPF
- `spellcheck="false"` em campos de email e código
- Erros exibidos inline, primeiro erro recebe foco ao submeter
- Botão de submit habilitado até a requisição — spinner durante o envio
- Aviso antes de navegar com formulário não salvo

#### Animações
- Respeitar `prefers-reduced-motion` em todas as animações
- Animar apenas `transform` e `opacity` (nunca `transition: all`)
- Drag no Kanban: desabilitar seleção de texto, usar `inert` em itens não draggáveis

#### Conteúdo e Tipografia
- Usar `…` (ellipsis real), não `...`
- Loading states: terminar com `…` (ex: "Carregando pedidos…")
- Números tabulares (`font-variant-numeric: tabular-nums`) em valores monetários e contagens
- Headings com `text-wrap: balance`
- Textos longos com `truncate` + `title` attribute para tooltip

#### Listas Grandes
- Listas com > 50 itens devem usar virtualização (ex: `@tanstack/react-virtual`)
- Aplicável a: lista de pedidos, histórico de clientes

#### Estado na URL
- Filtros, abas e paginação devem refletir estado na URL (searchParams)
- Links de navegação com `<Link>` do Next.js para suportar Cmd+Click
- Ações destrutivas (cancelar pedido, deletar cliente) exigem diálogo de confirmação

#### Responsividade Mobile
- `touch-action: manipulation` em todos os elementos interativos (evita delay de 300ms)
- Modais com `overscroll-behavior: contain`
- Safe areas para notch: `env(safe-area-inset-*)` no padding do layout mobile
- `autoFocus` apenas em desktop (nunca em mobile — abre teclado inesperadamente)

#### Internacionalização
- Datas formatadas com `Intl.DateTimeFormat` (locale `pt-BR`)
- Valores monetários com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- Nunca hardcodar formatos de data ou número

#### Dark Mode (futuro)
- `color-scheme: dark` no `<html>` quando implementado
- `<meta name="theme-color">` atualizado dinamicamente

---

## 7. API Routes (Next.js)

Todas as rotas sob `/api/` retornam JSON. Auth obrigatório via middleware.

### Clientes

| Método | Rota                  | Descrição                |
| ------ | --------------------- | ------------------------ |
| GET    | /api/clientes         | Listar (com busca)       |
| GET    | /api/clientes/[id]    | Detalhe com pedidos      |
| POST   | /api/clientes         | Criar                    |
| PATCH  | /api/clientes/[id]    | Atualizar                |
| DELETE | /api/clientes/[id]    | Soft delete              |

### Pedidos

| Método | Rota                          | Descrição                  |
| ------ | ----------------------------- | -------------------------- |
| GET    | /api/pedidos                  | Listar (filtros: status, data, cliente) |
| GET    | /api/pedidos/[id]             | Detalhe completo           |
| POST   | /api/pedidos                  | Criar (com itens)          |
| PATCH  | /api/pedidos/[id]             | Atualizar                  |
| PATCH  | /api/pedidos/[id]/status      | Alterar status + log       |
| PATCH  | /api/pedidos/[id]/progresso   | Alterar progresso          |
| PATCH  | /api/pedidos/[id]/pagamento   | Registrar pagamento        |

### Produtos

| Método | Rota                  | Descrição                |
| ------ | --------------------- | ------------------------ |
| GET    | /api/produtos         | Listar (filtro categoria)|
| POST   | /api/produtos         | Criar                    |
| PATCH  | /api/produtos/[id]    | Atualizar                |
| DELETE | /api/produtos/[id]    | Soft delete              |

### Categorias

| Método | Rota                  | Descrição                |
| ------ | --------------------- | ------------------------ |
| GET    | /api/categorias       | Listar                   |
| POST   | /api/categorias       | Criar                    |
| PATCH  | /api/categorias/[id]  | Atualizar                |

### Dashboard

| Método | Rota                  | Descrição                |
| ------ | --------------------- | ------------------------ |
| GET    | /api/dashboard        | Métricas agregadas       |
| GET    | /api/dashboard/chart  | Dados para gráfico mensal|

### Upload

| Método | Rota                  | Descrição                |
| ------ | --------------------- | ------------------------ |
| POST   | /api/upload           | Upload de imagem         |

---

## 8. Roadmap de Implementação

### Fase 0 — Setup e Fundação (Dia 1-2)

- [ ] Criar projeto Next.js 15 com App Router, TypeScript e Tailwind
- [ ] Configurar ESLint com regras de acessibilidade (`eslint-plugin-jsx-a11y`)
- [ ] Instalar e configurar shadcn/ui com paleta ConfeitFlow
- [ ] Setup Prisma + SQLite + seed de categorias
- [ ] NextAuth v5 com email/senha
- [ ] Middleware de autenticação em `(dashboard)/*`
- [ ] Layout base (Sidebar + Header + MobileNav) com safe areas e focus states

### Fase 1 — MVP (Semanas 1-3)

Objetivo: Sistema funcional para uso pessoal.

- [ ] Setup do projeto (Next.js + Prisma + SQLite + Auth)
- [ ] Layout base (Sidebar, Header, MobileNav)
- [ ] CRUD de Clientes
- [ ] CRUD de Produtos e Categorias
- [ ] CRUD de Pedidos (formulário multi-step)
- [ ] Kanban de Pedidos com drag-and-drop
- [ ] Detalhe do pedido com timeline
- [ ] Dashboard com métricas básicas
- [ ] Responsividade mobile

### Fase 2 — Polimento (Semanas 4-5)

- [ ] Calendário de entregas
- [ ] Financeiro básico
- [ ] Busca global (clientes + pedidos)
- [ ] Botão WhatsApp com mensagem template
- [ ] Upload de imagens (produtos e referências)
- [ ] Configurações do ateliê
- [ ] Loading states e empty states
- [ ] Tratamento de erros

### Fase 3 — Preparação para Produção (Semana 6)

- [ ] Migrar para PostgreSQL
- [ ] Deploy na Vercel
- [ ] Seed de dados de exemplo
- [ ] Testes básicos de API
- [ ] PWA (manifest + service worker para funcionar offline básico)
- [ ] SEO das rotas públicas

### Fase 4 — Vitrine Online (Futuro)

- [ ] Rota pública `/loja/[slug]` com catálogo do ateliê
- [ ] Formulário público de pedido (cliente preenche sem conta)
- [ ] Notificação por email/WhatsApp quando novo pedido chega
- [ ] Integração com pagamento (Mercado Pago ou Stripe)
- [ ] QR Code para divulgação da loja

### Fase 5 — Escala (Futuro)

- [ ] Multi-usuário (equipe do ateliê com roles)
- [ ] Controle de estoque de ingredientes
- [ ] Relatórios avançados (sazonalidade, produtos mais vendidos, clientes fiéis)
- [ ] Integração com iFood/Rappi
- [ ] App mobile nativo (React Native)
- [ ] Notificações push

---

## 9. Variáveis de Ambiente

```env
# .env.local

# Database
DATABASE_URL="file:./dev.db"

# Auth
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Upload de imagens
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
# OU
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

---

## 12. Checklist de Qualidade (pré-deploy)

### Performance
- [ ] Páginas de lista são Server Components (sem `"use client"` no topo)
- [ ] `KanbanBoard`, `RevenueChart` e calendário carregados com `next/dynamic`
- [ ] Fetches paralelos com `Promise.all()` no Dashboard
- [ ] `React.cache()` em funções de query reutilizadas na mesma request
- [ ] `<Suspense>` + `loading.tsx` em cada seção do dashboard

### Acessibilidade
- [ ] Todos os botões de ícone têm `aria-label`
- [ ] Todos os ícones decorativos têm `aria-hidden="true"`
- [ ] Todos os inputs têm `<label>` associado
- [ ] Focus indicator visível em modo teclado (`focus-visible:ring-2`)
- [ ] Nenhum `onClick` em `<div>` ou `<span>`
- [ ] Formulários com `autocomplete` correto
- [ ] Ações destrutivas com diálogo de confirmação
- [ ] Filtros e abas refletem estado na URL

### UI/UX
- [ ] `touch-action: manipulation` nos botões mobile
- [ ] Valores monetários com `Intl.NumberFormat`
- [ ] Datas com `Intl.DateTimeFormat('pt-BR')`
- [ ] Empty states implementados em todas as listas
- [ ] Números tabulares em tabelas de valores
- [ ] Aviso de unsaved changes nos formulários longos
- [ ] Listas > 50 itens virtualizadas

### Mobile
- [ ] Kanban funciona com scroll horizontal no mobile
- [ ] Bottom navigation funcional com safe area inset
- [ ] `autoFocus` desabilitado em mobile
- [ ] Modais com `overscroll-behavior: contain`

---

## 10. Comandos para Iniciar

```bash
# 1. Criar projeto (Next.js 15)
npx create-next-app@latest confeitflow --typescript --tailwind --eslint --app --src-dir

# 2. Instalar dependências
cd confeitflow
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install @tanstack/react-query
npm install zod react-hook-form @hookform/resolvers
npm install date-fns
npm install recharts
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react
npm install bcryptjs
npm install -D @types/bcryptjs
npm install -D eslint-plugin-jsx-a11y  # Acessibilidade
npm install @tanstack/react-virtual     # Virtualização de listas grandes

# 3. shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select textarea badge dialog sheet table tabs toast separator avatar dropdown-menu calendar popover command

# 4. Prisma
npx prisma init --datasource-provider sqlite
# Colar o schema acima em prisma/schema.prisma
npx prisma db push
npx prisma generate

# 5. Rodar
npm run dev
```

---

## 11. Critérios de Aceitação do MVP

O MVP está pronto quando:

1. ✅ Usuário consegue se cadastrar e fazer login.
2. ✅ Usuário consegue cadastrar clientes com nome, sobrenome e telefone.
3. ✅ Usuário consegue criar um pedido vinculado a um cliente, com itens, data de entrega e especificações.
4. ✅ Usuário consegue visualizar pedidos em um quadro Kanban e mover entre colunas.
5. ✅ Barra de progresso reflete o status e pode ser ajustada manualmente.
6. ✅ Dashboard mostra pedidos ativos, entregas do dia, entregas da semana e faturamento do mês.
7. ✅ Catálogo de produtos permite cadastrar com preço e foto.
8. ✅ Sistema funciona bem em tela de celular.
9. ✅ Dados persistem entre sessões (banco de dados).
10. ✅ Pedidos com entrega próxima são destacados visualmente.

---

*ConfeitFlow — Gestão doce, entregas no ponto.* 🍫
