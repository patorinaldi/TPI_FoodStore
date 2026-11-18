import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'

import { CLAVE_PRODUCTOS } from '../../productos/hooks/useProductos'
import { cambiarEstadoPedido, cancelarPedido, crearPedido, listarPedidos, obtenerResumen } from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos } from '../types/pedido'

export const CLAVE_PEDIDOS = ['pedidos'] as const
export const CLAVE_RESUMEN = ['resumen'] as const

// Crear, cancelar o cambiar el estado de un pedido puede mover stock, así que también quedan viejos el catálogo y el resumen del panel.
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

export function useResumenPedidos() {
  return useQuery({ queryKey: CLAVE_RESUMEN, queryFn: obtenerResumen })
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

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: () => invalidarTrasCambio(queryClient),
  })
}
