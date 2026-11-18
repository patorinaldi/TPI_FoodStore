import { api } from '../../../shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto'

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return data
}

export async function crearProducto(producto: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', producto)
  return data
}

export async function actualizarProducto(id: number, cambios: ProductoUpdate): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, cambios)
  return data
}

export async function actualizarStock(id: number, stock: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, stock)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
