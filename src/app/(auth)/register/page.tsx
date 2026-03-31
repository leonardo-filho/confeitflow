import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  async function action(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const atelieName = formData.get('atelieName') as string

    if (!name || !email || !password) {
      throw new Error('Campos obrigatórios não preenchidos')
    }
    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new Error('E-mail já cadastrado')
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password,
        atelieName: atelieName || null,
      },
    })

    const defaultCategories = [
      'Bolos Decorados',
      'Ovos de Colher',
      'Brigadeiros e Docinhos',
      'Tortas e Cheesecakes',
      'Brownies e Cookies',
      'Kits e Cestas',
    ]

    await prisma.categoria.createMany({
      data: defaultCategories.map((nome, i) => ({
        nome,
        ordem: i,
        userId: user.id,
      })),
    })

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6 lg:p-12">
        {/* Mobile logo */}
        <div className="mb-8 text-center lg:hidden">
          <h1 className="text-3xl font-bold text-primary font-display">
            ConfeitFlow
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão para o seu ateliê
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Criar conta
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Configure seu ateliê e comece a gerenciar seus pedidos
            </p>
          </div>

          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="atelieName">Nome do ateliê</Label>
              <Input
                id="atelieName"
                name="atelieName"
                type="text"
                placeholder="Ex: Doces da Maria"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full">
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>

      {/* Right decorative panel — hidden on mobile */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F4845F 0%, #8B5A3C 50%, #5C3D2E 100%)',
        }}
        aria-hidden="true"
      >
        {/* Decorative circles */}
        <div
          className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        />
        <div
          className="absolute top-1/2 right-[-40px] w-32 h-32 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        />

        {/* SVG wave decoration */}
        <svg
          className="absolute top-0 left-0 right-0 w-full opacity-20 rotate-180"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="white"
          />
        </svg>

        <div className="relative z-10 text-center px-12">
          <h1
            className="text-5xl font-bold text-white mb-4 font-display"
          >
            ConfeitFlow
          </h1>
          <p className="text-white/80 text-lg font-medium text-balance">
            Seu ateliê merece uma gestão à altura da sua arte
          </p>
          <div className="mt-8 flex flex-col gap-3 text-white/70 text-sm">
            <p>Controle total dos seus pedidos</p>
            <p>Histórico completo de clientes</p>
            <p>Visão clara do seu faturamento</p>
          </div>
        </div>
      </div>
    </div>
  )
}
