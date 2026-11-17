import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import type { FormaPago, Pedido } from '../types/pedido'

const TEXTO_FORMA_PAGO: Record<FormaPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
}

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        <dt className="text-stone-500">Estado</dt>
        <dd>
          <BadgeEstado estado={pedido.estado} />
        </dd>
        <dt className="text-stone-500">Creado</dt>
        <dd className="text-stone-800">{formatearFecha(pedido.created_at)}</dd>
        <dt className="text-stone-500">Última actualización</dt>
        <dd className="text-stone-800">{formatearFecha(pedido.updated_at)}</dd>
        <dt className="text-stone-500">Forma de pago</dt>
        <dd className="text-stone-800">{TEXTO_FORMA_PAGO[pedido.forma_pago]}</dd>
        <dt className="text-stone-500">Dirección</dt>
        <dd className="break-words text-stone-800">{pedido.direccion_entrega}</dd>
        {pedido.notas && (
          <>
            <dt className="text-stone-500">Notas</dt>
            <dd className="break-words text-stone-800">{pedido.notas}</dd>
          </>
        )}
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs text-stone-500 uppercase">
              <th className="py-2 font-medium">Producto</th>
              <th className="py-2 text-right font-medium">Precio</th>
              <th className="py-2 text-right font-medium">Cant.</th>
              <th className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {pedido.items.map((detalle) => (
              <tr key={detalle.producto_id}>
                <td className="py-2 text-stone-800">{detalle.nombre_producto}</td>
                <td className="py-2 text-right tabular-nums">{formatearPrecio(detalle.precio_unitario)}</td>
                <td className="py-2 text-right tabular-nums">{detalle.cantidad}</td>
                <td className="py-2 text-right font-medium tabular-nums">{formatearPrecio(detalle.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-stone-200">
              <td colSpan={3} className="py-2 font-semibold text-stone-900">
                Total
              </td>
              <td className="py-2 text-right text-base font-bold tabular-nums">{formatearPrecio(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
