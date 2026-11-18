import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'

import { CLAVE_PRODUCTOS } from '../../productos/hooks/useProductos'
import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from '../api/categorias'
import type { CategoriaUpdate } from '../types/categoria'

export const CLAVE_CATEGORIAS = ['categorias'] as const

// Los productos traen la categoría embebida, así que un cambio de nombre o una baja también los deja viejos.
function invalidarCategorias(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: CLAVE_CATEGORIAS }),
    queryClient.invalidateQueries({ queryKey: CLAVE_PRODUCTOS }),
  ])
}

export function useCategorias() {
  return useQuery({ queryKey: CLAVE_CATEGORIAS, queryFn: listarCategorias })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: crearCategoria, onSuccess: () => invalidarCategorias(queryClient) })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cambios }: { id: number; cambios: CategoriaUpdate }) => actualizarCategoria(id, cambios),
    onSuccess: () => invalidarCategorias(queryClient),
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: eliminarCategoria, onSuccess: () => invalidarCategorias(queryClient) })
}
