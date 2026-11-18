import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'

import { Button } from '../ui/Button'

interface TablaDatosProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  /** Si se pasa, muestra un buscador que filtra sobre todas las columnas. */
  placeholderFiltro?: string
  /** false cuando la paginación la resuelve el servidor y la tabla solo muestra la página actual. */
  paginar?: boolean
  tamanioPagina?: number
  mensajeVacio?: string
}

const ICONO_ORDEN = { asc: ' ▲', desc: ' ▼' } as const

export function TablaDatos<T>({
  datos,
  columnas,
  placeholderFiltro,
  paginar = true,
  tamanioPagina = 10,
  mensajeVacio = 'No hay datos para mostrar',
}: TablaDatosProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtroGlobal, setFiltroGlobal] = useState('')

  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    state: { sorting, globalFilter: filtroGlobal },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltroGlobal,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginar && { getPaginationRowModel: getPaginationRowModel() }),
    initialState: { pagination: { pageSize: tamanioPagina } },
    // Por defecto las columnas numéricas arrancan descendente; acá el primer click siempre ordena de menor a mayor.
    sortDescFirst: false,
    // Sin esto, cualquier cambio en los datos (por ejemplo después de editar) vuelve a la página 1.
    autoResetPageIndex: false,
  })

  const filas = tabla.getRowModel().rows
  const cantidadFiltrada = tabla.getFilteredRowModel().rows.length

  return (
    <div className="flex flex-col gap-3">
      {placeholderFiltro !== undefined && (
        <input
          type="search"
          aria-label="Filtrar tabla"
          placeholder={placeholderFiltro}
          value={filtroGlobal}
          onChange={(e) => {
            setFiltroGlobal(e.target.value)
            tabla.setPageIndex(0)
          }}
          className="w-full max-w-sm rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-50">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const ordenable = header.column.getCanSort()
                  const orden = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={orden === 'asc' ? 'ascending' : orden === 'desc' ? 'descending' : undefined}
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-stone-500 uppercase"
                    >
                      {header.isPlaceholder ? null : ordenable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="uppercase hover:text-stone-800"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {orden ? ICONO_ORDEN[orden] : ''}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="px-4 py-10 text-center text-stone-500">
                  {filtroGlobal ? 'Ningún resultado coincide con el filtro' : mensajeVacio}
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="hover:bg-stone-50">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle text-stone-700">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginar && tabla.getPageCount() > 1 && (
        <nav className="flex items-center justify-between gap-4" aria-label="Paginación de la tabla">
          <Button variante="secundario" tamanio="sm" disabled={!tabla.getCanPreviousPage()} onClick={() => tabla.previousPage()}>
            ← Anterior
          </Button>
          <span className="text-sm text-stone-600">
            Página {tabla.getState().pagination.pageIndex + 1} de {tabla.getPageCount()} · {cantidadFiltrada} registros
          </span>
          <Button variante="secundario" tamanio="sm" disabled={!tabla.getCanNextPage()} onClick={() => tabla.nextPage()}>
            Siguiente →
          </Button>
        </nav>
      )}
    </div>
  )
}
