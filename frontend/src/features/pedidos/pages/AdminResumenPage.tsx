import { Link } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useResumenPedidos } from '../hooks/usePedidos'
import type { ResumenPedidos } from '../types/pedido'

interface Indicador {
  titulo: string
  valor: (r: ResumenPedidos) => string
  acento: string
}

const INDICADORES: Indicador[] = [
  { titulo: 'Pendientes', valor: (r) => String(r.pendientes), acento: 'border-l-amber-400' },
  { titulo: 'En preparación', valor: (r) => String(r.en_preparacion), acento: 'border-l-sky-400' },
  { titulo: 'Entregados', valor: (r) => String(r.entregados), acento: 'border-l-emerald-400' },
  { titulo: 'Cancelados', valor: (r) => String(r.cancelados), acento: 'border-l-red-400' },
  { titulo: 'Pedidos de hoy', valor: (r) => String(r.pedidos_hoy), acento: 'border-l-stone-400' },
  { titulo: 'Ingresos (entregados)', valor: (r) => formatearPrecio(r.ingresos_entregados), acento: 'border-l-orange-500' },
]

const ACCESOS = [
  { to: '/admin/pedidos', texto: 'Gestionar pedidos' },
  { to: '/admin/productos', texto: 'Productos y stock' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

export default function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Resumen</h1>
        <p className="text-sm text-stone-500">Estado general de los pedidos del local</p>
      </div>

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando resumen">
          {INDICADORES.map((i) => (
            <Skeleton key={i.titulo} className="h-28" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error, 'No se pudo cargar el resumen')} onReintentar={() => void refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDICADORES.map((indicador) => (
            <Card key={indicador.titulo} className={`border-l-4 p-5 ${indicador.acento}`}>
              <p className="text-sm font-medium text-stone-500">{indicador.titulo}</p>
              <p className="mt-2 text-3xl font-bold text-stone-900 tabular-nums">{indicador.valor(data)}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ACCESOS.map((acceso) => (
          <Link
            key={acceso.to}
            to={acceso.to}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            {acceso.texto} →
          </Link>
        ))}
      </div>
    </div>
  )
}
