import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { listarProductos } from '../api/productos'
import type { FiltrosProductos } from '../types/producto'

export const CLAVE_PRODUCTOS = ['productos'] as const

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: [...CLAVE_PRODUCTOS, filtros],
    queryFn: () => listarProductos(filtros),
    // Mantiene la página anterior en pantalla mientras llega la siguiente, así la grilla no parpadea.
    placeholderData: keepPreviousData,
  })
}
