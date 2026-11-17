import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  mensaje?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <span className="text-4xl" aria-hidden>
        🍽️
      </span>
      <h3 className="text-base font-semibold text-stone-800">{titulo}</h3>
      {mensaje && <p className="max-w-sm text-sm text-stone-500">{mensaje}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  )
}
