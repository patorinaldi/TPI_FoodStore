import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number
  tamanioPagina: number
  total: number
  onCambiar: (pagina: number) => void
}

/** La página es base 0, igual que el cálculo skip = pagina × limit que espera la API. */
export function Paginacion({ pagina, tamanioPagina, total, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / tamanioPagina))
  if (total <= tamanioPagina) return null

  return (
    <nav className="flex items-center justify-between gap-4 pt-4" aria-label="Paginación">
      <Button variante="secundario" tamanio="sm" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </Button>
      <span className="text-sm text-stone-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        tamanio="sm"
        disabled={pagina + 1 >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </Button>
    </nav>
  )
}
