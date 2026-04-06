'use client'

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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

const mainLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/catalogo', label: 'Catálogo', icon: Package },
  { href: '/calendario', label: 'Calendário', icon: Calendar },
]

const secondaryLinks = [
  { href: '/financeiro', label: 'Financeiro', icon: TrendingUp },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  function getInitials(name?: string | null) {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  function isActive(href: string) {
    return href === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/'
      : pathname.startsWith(href)
  }

  return (
    <aside className="sidebar-compact hidden md:flex flex-col h-screen sticky top-0 shrink-0 gradient-sidebar text-sidebar-foreground z-40">
      {/* Logo */}
      <div className="sidebar-header px-3 py-4 border-b border-white/5 flex items-center overflow-hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl overflow-hidden shrink-0 shadow-glow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo.jpg"
              alt="ConfeitFlow"
              className="w-full h-full object-cover"
            />
          </div>
          <span
            className="sidebar-label text-xl font-bold text-white tracking-tight whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            ConfeitFlow
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-hidden" aria-label="Navegação principal">
        <p className="sidebar-section-label text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 px-3 pt-3 pb-2 whitespace-nowrap overflow-hidden">
          Menu
        </p>
        {mainLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'nav-indicator flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
              isActive(href)
                ? 'active bg-white/10 text-white shadow-soft'
                : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-white'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 shrink-0',
                isActive(href)
                  ? 'gradient-primary shadow-glow'
                  : 'bg-white/5 group-hover:bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="sidebar-label whitespace-nowrap overflow-hidden">{label}</span>
          </Link>
        ))}

        <div className="my-3 mx-2 border-t border-white/5" />

        <p className="sidebar-section-label text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 px-3 pt-1 pb-2 whitespace-nowrap overflow-hidden">
          Gestão
        </p>
        {secondaryLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'nav-indicator flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
              isActive(href)
                ? 'active bg-white/10 text-white shadow-soft'
                : 'text-sidebar-foreground/70 hover:bg-white/5 hover:text-white'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 shrink-0',
                isActive(href)
                  ? 'gradient-primary shadow-glow'
                  : 'bg-white/5 group-hover:bg-white/10'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="sidebar-label whitespace-nowrap overflow-hidden">{label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-2 border-t border-white/5">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 p-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold shrink-0 ring-2 ring-white/10">
            {getInitials(user.name)}
          </div>
          <div className="sidebar-label flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name ?? 'Usuário'}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
