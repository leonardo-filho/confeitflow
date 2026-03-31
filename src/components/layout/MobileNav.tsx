'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Calendar,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/calendario', label: 'Agenda', icon: Calendar },
  { href: '/configuracoes', label: 'Mais', icon: MoreHorizontal },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-background/80 backdrop-blur-lg border-t border-border/50 safe-bottom touch-action-manipulation"
      aria-label="Navegação móvel"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-all duration-200 relative',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground active:text-foreground'
            )}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full gradient-primary" />
            )}
            <div
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary/10 scale-110'
                  : ''
              )}
            >
              <Icon
                className={cn('h-5 w-5 transition-all', isActive && 'text-primary')}
                aria-hidden="true"
              />
            </div>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
