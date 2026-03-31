'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UpdatePedidoModal, EditPedidoData } from './UpdatePedidoModal'
import { Edit2 } from 'lucide-react'

interface UpdatePedidoButtonProps {
    pedido: EditPedidoData
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
    showText?: boolean
}

export function UpdatePedidoButton({
    pedido,
    variant = 'outline',
    size = 'sm',
    className,
    showText = true
}: UpdatePedidoButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsModalOpen(true)
                }}
                aria-label="Atualizar Andamento"
            >
                <Edit2 className={`${showText ? 'mr-2' : ''} h-4 w-4`} aria-hidden="true" />
                {showText && 'Atualizar Andamento'}
            </Button>

            <UpdatePedidoModal
                pedido={pedido}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    )
}
