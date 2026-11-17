import { useState, type FormEvent } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'
import type { FiltrosProductos } from '../types/producto'

const TAMANIO_PAGINA = 8

export default function CatalogoPage() {
  // Lo que se escribe en el buscador vs. lo que ya se mandó: la query solo cambia al enviar el form.
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [pagina, setPagina] = useState(0)

  const filtros: FiltrosProductos = {
    skip: pagina * TAMANIO_PAGINA,
    limit: TAMANIO_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId,
    disponible: soloDisponibles ? true : undefined,
  }

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductos(filtros)
  const { data: categorias } = useCategorias()

  const buscar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusqueda(textoBusqueda.trim())
    setPagina(0)
  }

  const limpiarFiltros = () => {
    setTextoBusqueda('')
    setBusqueda('')
    setCategoriaId(undefined)
    setSoloDisponibles(false)
    setPagina(0)
  }

  const hayFiltros = Boolean(busqueda) || categoriaId !== undefined || soloDisponibles

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Catálogo</h1>
        <p className="text-sm text-stone-500">Elegí tus productos y armá el pedido</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
        <form role="search" onSubmit={buscar} className="flex flex-1 gap-2">
          <label htmlFor="busqueda" className="sr-only">
            Buscar productos
          </label>
          <input
            id="busqueda"
            type="search"
            placeholder="Buscar por nombre…"
            maxLength={100}
            value={textoBusqueda}
            onChange={(e) => setTextoBusqueda(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <Button type="submit">Buscar</Button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="categoria" className="sr-only">
            Categoría
          </label>
          <select
            id="categoria"
            value={categoriaId ?? ''}
            onChange={(e) => {
              setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
              setPagina(0)
            }}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">Todas las categorías</option>
            {categorias?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(e) => {
                setSoloDisponibles(e.target.checked)
                setPagina(0)
              }}
              className="size-4 accent-orange-600"
            />
            Solo disponibles
          </label>

          {hayFiltros && (
            <Button variante="fantasma" tamanio="sm" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
          {Array.from({ length: TAMANIO_PAGINA }, (_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error, 'No se pudo cargar el catálogo')} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje={hayFiltros ? 'Probá con otra búsqueda o sacá algún filtro.' : 'Todavía no hay productos cargados.'}
          accion={
            hayFiltros && (
              <Button variante="secundario" tamanio="sm" onClick={limpiarFiltros}>
                Ver todo el catálogo
              </Button>
            )
          }
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <p className="mb-3 text-sm text-stone-500">
            {data.total} {data.total === 1 ? 'producto' : 'productos'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion pagina={pagina} tamanioPagina={TAMANIO_PAGINA} total={data.total} onCambiar={setPagina} />
        </div>
      )}
    </div>
  )
}
