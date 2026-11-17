import { api } from '../../../shared/api/axiosInstance'
import type { FiltrosProductos, ProductosPaginados } from '../types/producto'

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}
