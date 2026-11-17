import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Producto } from '../features/productos/types/producto'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
  stock: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Producto, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id
                  ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock), stock: producto.stock }
                  : i,
              ),
            }
          }
          const nuevo: ItemCarrito = {
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            cantidad: Math.min(cantidad, producto.stock),
            imagen_url: producto.imagen_url,
            stock: producto.stock,
          }
          return { items: [...state.items, nuevo] }
        }),

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.producto_id === productoId ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i))
            .filter((i) => i.cantidad > 0),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'foodstore-carrito' },
  ),
)
