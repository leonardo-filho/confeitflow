import { signIn } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  async function action(formData: FormData) {
    'use server'
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/dashboard',
      })
    } catch (e) {
      throw e
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel — hidden on mobile */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #5C3D2E 0%, #8B5A3C 50%, #F4845F 100%)',
        }}
        aria-hidden="true"
      >
        {/* Decorative circles */}
        <div
          className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
        <div
          className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        />
        <div
          className="absolute top-1/2 left-[-40px] w-32 h-32 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        />

        {/* SVG wave decoration */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-20"
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
            Gestão inteligente para o seu ateliê de confeitaria artesanal
          </p>
          <div className="mt-8 flex flex-col gap-3 text-white/70 text-sm">
            <p>Organize pedidos, clientes e finanças</p>
            <p>Nunca perca um prazo de entrega</p>
            <p>Cresça com controle e confiança</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
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
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Entre na sua conta para gerenciar seu ateliê
            </p>
          </div>

          <form action={action} className="space-y-4">
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
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{' '}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
