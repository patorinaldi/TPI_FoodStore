import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

function textoStock(producto: Producto): { texto: string; clase: string } {
  if (!producto.disponible) return { texto: 'No disponible', clase: 'text-stone-500' }
  if (producto.stock === 0) return { texto: 'Sin stock', clase: 'text-red-600' }
  if (producto.stock <= 5) return { texto: `¡Quedan ${producto.stock}!`, clase: 'text-amber-700' }
  return { texto: `Stock: ${producto.stock}`, clase: 'text-stone-500' }
}

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)

  const sinStockRestante = enCarrito >= producto.stock
  const puedeAgregar = producto.disponible && producto.stock > 0 && !sinStockRestante
  const stock = textoStock(producto)

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="aspect-[4/3] bg-stone-100">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl" aria-hidden>
            🍔
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
          {producto.categoria.nombre}
        </span>
        <h3 className="font-semibold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}

        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-lg font-bold text-stone-900">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-xs font-medium ${stock.clase}`}>{stock.texto}</span>
        </div>

        <Button disabled={!puedeAgregar} onClick={() => agregar(producto)}>
          {enCarrito > 0 ? `Agregar otro (${enCarrito} en el carrito)` : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  )
}
