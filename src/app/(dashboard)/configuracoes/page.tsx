import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ConfiguracoesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  async function updateProfile(formData: FormData) {
    'use server'
    const session = await auth()
    if (!session?.user?.id) return

    const name = formData.get('name') as string
    const atelieName = formData.get('atelieName') as string
    const phone = formData.get('phone') as string

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        atelieName: atelieName || null,
        phone: phone || null,
      },
    })

    revalidatePath('/configuracoes')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie seu perfil e preferências
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user?.name ?? ''}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="atelieName">Nome do ateliê</Label>
              <Input
                id="atelieName"
                name="atelieName"
                defaultValue={user?.atelieName ?? ''}
                placeholder="Ex: Doces da Maria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user?.phone ?? ''}
                placeholder="(11) 99999-9999"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email ?? ''}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado.
              </p>
            </div>

            <Button type="submit">Salvar alterações</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium text-sm">E-mail</p>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Versão</p>
              <p className="text-muted-foreground text-sm">ConfeitFlow v0.1</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
