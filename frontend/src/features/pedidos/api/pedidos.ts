import { api } from '../../../shared/api/axiosInstance'
import type { FiltrosPedidos, Pedido, PedidoCreate, PedidosPaginados, ResumenPedidos } from '../types/pedido'

export async function crearPedido(pedido: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>('/pedidos', pedido)
  return data
}

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>('/pedidos', { params: filtros })
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function obtenerResumen(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>('/pedidos/resumen')
  return data
}
