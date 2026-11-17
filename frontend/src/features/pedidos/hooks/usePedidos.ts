import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'

import { CLAVE_PRODUCTOS } from '../../productos/hooks/useProductos'
import { cancelarPedido, crearPedido, listarPedidos } from '../api/pedidos'
import type { FiltrosPedidos } from '../types/pedido'

export const CLAVE_PEDIDOS = ['pedidos'] as const
export const CLAVE_RESUMEN = ['resumen'] as const

// Crear o cancelar un pedido mueve stock, así que también quedan viejos el catálogo y el resumen del panel.
function invalidarTrasCambio(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: CLAVE_PEDIDOS }),
    queryClient.invalidateQueries({ queryKey: CLAVE_PRODUCTOS }),
    queryClient.invalidateQueries({ queryKey: CLAVE_RESUMEN }),
  ])
}

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: [...CLAVE_PEDIDOS, filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => invalidarTrasCambio(queryClient),
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => invalidarTrasCambio(queryClient),
  })
}
