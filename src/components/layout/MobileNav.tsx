'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Calendar,
  TrendingUp,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mainItems = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/catalogo', label: 'Catálogo', icon: Package },
]

const moreItems = [
  { href: '/calendario', label: 'Calendário', icon: Calendar },
  { href: '/financeiro', label: 'Financeiro', icon: TrendingUp },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function isActiveHref(href: string, pathname: string) {
  return href === '/dashboard'
    ? pathname === '/dashboard' || pathname === '/'
    : pathname.startsWith(href)
}

export default function MobileNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreActive = moreItems.some((i) => isActiveHref(i.href, pathname))

  return (
    <>
      {/* More panel overlay */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          {/* Bottom sheet */}
          <div className="fixed bottom-[57px] left-2 right-2 z-50 md:hidden rounded-2xl border bg-background/95 backdrop-blur-lg shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Mais opções
              </p>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreItems.map(({ href, label, icon: Icon }) => {
                const active = isActiveHref(href, pathname)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'h-9 w-9 rounded-xl flex items-center justify-center transition-all',
                        active ? 'gradient-primary shadow-glow' : 'bg-muted'
                      )}
                    >
                      <Icon className={cn('h-4.5 w-4.5', active ? 'text-white' : '')} aria-hidden="true" />
                    </div>
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-background/90 backdrop-blur-lg border-t border-border/50 safe-bottom touch-action-manipulation"
        aria-label="Navegação móvel"
      >
        {mainItems.map(({ href, label, icon: Icon }) => {
          const active = isActiveHref(href, pathname)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-all duration-200 relative',
                active ? 'text-primary' : 'text-muted-foreground active:text-foreground'
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full gradient-primary" />
              )}
              <div
                className={cn(
                  'flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200',
                  active ? 'bg-primary/10 scale-110' : ''
                )}
              >
                <Icon className={cn('h-5 w-5 transition-all', active ? 'text-primary' : '')} aria-hidden="true" />
              </div>
              <span>{label}</span>
            </Link>
          )
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-label="Mais opções de navegação"
          aria-expanded={moreOpen}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-all duration-200 relative',
            moreActive || moreOpen ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {(moreActive || moreOpen) && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full gradient-primary" />
          )}
          <div
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200',
              moreOpen ? 'bg-primary/10 scale-110' : moreActive ? 'bg-primary/10' : ''
            )}
          >
            <MoreHorizontal
              className={cn('h-5 w-5 transition-all', moreActive || moreOpen ? 'text-primary' : '')}
              aria-hidden="true"
            />
          </div>
          <span>Mais</span>
        </button>
      </nav>
    </>
  )
}
