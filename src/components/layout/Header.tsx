'use client'

import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/pedidos': 'Pedidos',
  '/pedidos/novo': 'Novo Pedido',
  '/clientes': 'Clientes',
  '/clientes/novo': 'Novo Cliente',
  '/catalogo': 'Catálogo',
  '/catalogo/novo': 'Novo Produto',
  '/calendario': 'Calendário',
  '/financeiro': 'Financeiro',
  '/configuracoes': 'Configurações',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/pedidos/')) return 'Detalhes do Pedido'
  if (pathname.startsWith('/clientes/')) return 'Detalhes do Cliente'
  if (pathname.startsWith('/catalogo/')) return 'Detalhes do Produto'
  return 'ConfeitFlow'
}

function getInitials(name?: string | null) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:px-6 transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile: show logo + brand */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-7 w-7 rounded-lg overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.jpg"
              alt="ConfeitFlow"
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className="text-lg font-bold text-primary"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            ConfeitFlow
          </span>
        </div>
        {/* Desktop: show current page title */}
        <h1 className="hidden md:block text-lg font-semibold text-foreground">
          {title}
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-muted/60 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Menu do usuário"
        >
          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold ring-2 ring-primary/20">
            {getInitials(user.name)}
          </div>
          <span className="hidden md:block text-sm font-medium">
            {user.name?.split(' ')[0]}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 animate-scale-in">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold">{user.name ?? 'Usuário'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <a href="/configuracoes" className="flex items-center gap-2 w-full">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Configurações
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-0">
            <form action={signOutAction} className="w-full">
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
