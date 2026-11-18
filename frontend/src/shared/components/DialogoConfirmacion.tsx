import type { ReactNode } from 'react'

import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface DialogoConfirmacionProps {
  abierto: boolean
  titulo: string
  children: ReactNode
  textoConfirmar: string
  cargando?: boolean
  error?: string | null
  onConfirmar: () => void
  onCancelar: () => void
}

export function DialogoConfirmacion({
  abierto,
  titulo,
  children,
  textoConfirmar,
  cargando = false,
  error,
  onConfirmar,
  onCancelar,
}: DialogoConfirmacionProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCancelar}>
      <div className="flex flex-col gap-4 text-sm">
        <div className="text-stone-700">{children}</div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onCancelar}>
            Volver
          </Button>
          <Button variante="peligro" cargando={cargando} onClick={onConfirmar}>
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
