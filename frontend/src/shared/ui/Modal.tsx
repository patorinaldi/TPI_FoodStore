import type { ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  ancho?: 'md' | 'lg'
}

// React solo respeta autoFocus en inputs y botones. Al estar definida fuera del componente, la referencia
// es estable y React la llama una sola vez al montar el diálogo, así Esc funciona sin tener que hacer click.
const enfocarAlMontar = (elemento: HTMLDivElement | null) => elemento?.focus()

export function Modal({ abierto, titulo, onCerrar, children, ancho = 'md' }: ModalProps) {
  if (!abierto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        tabIndex={-1}
        ref={enfocarAlMontar}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onCerrar()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-xl outline-none ${ancho === 'lg' ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <h2 id="modal-titulo" className="text-lg font-semibold text-stone-900">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-md p-1 text-2xl leading-none text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
