import { Link, useNavigate } from 'react-router-dom'

import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import { ItemCarritoFila } from '../components/ItemCarritoFila'

export default function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const cantidadTotal = useCartStore((s) => s.cantidadTotal())
  const vaciar = useCartStore((s) => s.vaciar)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo para armar tu pedido."
        accion={
          <Link to="/" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Carrito</h1>
        <Button variante="fantasma" tamanio="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="px-5 lg:col-span-2">
          <ul className="divide-y divide-stone-200">
            {items.map((item) => (
              <ItemCarritoFila key={item.producto_id} item={item} />
            ))}
          </ul>
        </Card>

        <Card className="flex h-fit flex-col gap-4 p-5">
          <h2 className="font-semibold text-stone-900">Resumen</h2>
          <div className="flex justify-between text-sm text-stone-600">
            <span>Productos</span>
            <span>{cantidadTotal}</span>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-bold text-stone-900">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <p className="text-xs text-stone-500">
            El precio final lo confirma el servidor al crear el pedido, con el precio vigente de cada producto.
          </p>
          <Button onClick={() => navigate('/checkout')}>Continuar con el pedido</Button>
          <Link to="/" className="text-center text-sm font-medium text-orange-700 hover:underline">
            Seguir comprando
          </Link>
        </Card>
      </div>
    </div>
  )
}
