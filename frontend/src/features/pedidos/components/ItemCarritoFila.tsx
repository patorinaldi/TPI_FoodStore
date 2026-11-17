import { Button } from '../../../shared/ui/Button'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore, type ItemCarrito } from '../../../store/cartStore'

export function ItemCarritoFila({ item }: { item: ItemCarrito }) {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {item.imagen_url && <img src={item.imagen_url} alt="" className="size-full object-cover" />}
      </div>

      <div className="min-w-40 flex-1">
        <p className="font-medium text-stone-900">{item.nombre}</p>
        <p className="text-sm text-stone-500">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>

      <div className="flex items-center gap-2" role="group" aria-label={`Cantidad de ${item.nombre}`}>
        <Button
          variante="secundario"
          tamanio="sm"
          aria-label="Restar uno"
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
        >
          −
        </Button>
        <span className="w-8 text-center font-medium tabular-nums" aria-live="polite">
          {item.cantidad}
        </span>
        <Button
          variante="secundario"
          tamanio="sm"
          aria-label="Sumar uno"
          disabled={item.cantidad >= item.stock}
          title={item.cantidad >= item.stock ? 'No hay más stock disponible' : undefined}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
        >
          +
        </Button>
      </div>

      <p className="w-28 text-right font-semibold text-stone-900 tabular-nums">
        {formatearPrecio(item.precio_unitario * item.cantidad)}
      </p>

      <Button variante="fantasma" tamanio="sm" onClick={() => quitar(item.producto_id)}>
        Quitar
      </Button>
    </li>
  )
}
