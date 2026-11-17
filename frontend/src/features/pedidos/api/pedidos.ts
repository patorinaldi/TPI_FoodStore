import { api } from '../../../shared/api/axiosInstance'
import type { Pedido, PedidoCreate } from '../types/pedido'

export async function crearPedido(pedido: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>('/pedidos', pedido)
  return data
}
