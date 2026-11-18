import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { actualizarProducto, actualizarStock, crearProducto, eliminarProducto, listarProductos } from '../api/productos'
import type { FiltrosProductos, ProductoStockUpdate, ProductoUpdate } from '../types/producto'

export const CLAVE_PRODUCTOS = ['productos'] as const

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: [...CLAVE_PRODUCTOS, filtros],
    queryFn: () => listarProductos(filtros),
    // Mantiene la página anterior en pantalla mientras llega la siguiente, así la grilla no parpadea.
    placeholderData: keepPreviousData,
  })
}

function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: CLAVE_PRODUCTOS })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: crearProducto, onSuccess: invalidar })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, cambios }: { id: number; cambios: ProductoUpdate }) => actualizarProducto(id, cambios),
    onSuccess: invalidar,
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: ProductoStockUpdate }) => actualizarStock(id, stock),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({ mutationFn: eliminarProducto, onSuccess: invalidar })
}
