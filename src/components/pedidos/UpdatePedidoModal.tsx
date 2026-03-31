'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { statusLabel, progressoParaStatus } from '@/lib/utils'
import { Save, Loader2 } from 'lucide-react'

export interface EditPedidoData {
    id: string
    numero: number
    status: string
    progresso: number
}

interface UpdatePedidoModalProps {
    pedido: EditPedidoData | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdated?: () => void
}

const STATUS_OPTIONS = [
    'RECEBIDO',
    'CONFIRMADO',
    'EM_PRODUCAO',
    'DECORACAO',
    'PRONTO',
    'ENTREGUE',
]

export function UpdatePedidoModal({ pedido, open, onOpenChange, onUpdated }: UpdatePedidoModalProps) {
    const router = useRouter()
    const [currentStatus, setCurrentStatus] = useState<string>('')
    const [currentProgresso, setCurrentProgresso] = useState<number>(0)
    const [isSaving, setIsSaving] = useState(false)

    // Sincroniza o estado interno com a prop
    useEffect(() => {
        if (open && pedido) {
            setCurrentStatus(pedido.status)
            setCurrentProgresso(pedido.progresso)
        }
    }, [open, pedido])

    const handleStatusChange = (newStatus: string) => {
        setCurrentStatus(newStatus)
        // Ao trocar o status, atualizamos o progresso para o "esperado" pro usuário ter um bom default,
        // mas ele fica livre pra mexer no slider depois
        const automaticProgresso = progressoParaStatus(newStatus)
        setCurrentProgresso(automaticProgresso)
    }

    const handleProgressoChange = (value: number[]) => {
        setCurrentProgresso(value[0])
    }

    const handleSubmit = async () => {
        if (!pedido) return

        setIsSaving(true)
        try {
            const response = await fetch(`/api/pedidos/${pedido.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: currentStatus,
                    progresso: currentProgresso,
                }),
            })

            if (!response.ok) {
                throw new Error('Falha ao atualizar o pedido')
            }

            toast.success('Andamento do pedido atualizado!')
            onOpenChange(false)

            if (onUpdated) {
                onUpdated()
            } else {
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast.error('Ocorreu um erro ao salvar o pedido. Tente novamente.')
        } finally {
            setIsSaving(false)
        }
    }

    if (!pedido) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Atualizar Andamento</DialogTitle>
                    <DialogDescription>
                        Atualize o status e o percentual de conclusão do pedido #{pedido.numero}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Status do Pedido</h4>
                        <Select value={currentStatus} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {statusLabel(status)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Progresso de Produção</h4>
                            <span className="text-sm font-bold text-primary">{currentProgresso}%</span>
                        </div>

                        <div className="pt-2 pb-1">
                            <Slider
                                value={[currentProgresso]}
                                min={0}
                                max={100}
                                step={5}
                                onValueChange={handleProgressoChange}
                                className="my-2"
                            />
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>0% (Início)</span>
                            <span>100% (Pronto/Entregue)</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
