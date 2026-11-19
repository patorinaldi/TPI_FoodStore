import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { useAuthStore } from '../../../store/authStore'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types/pedido'
import { OPCIONES_FILTRO_ESTADO } from '../utils/estados'

const TAMANIO_PAGINA = 5

interface EstadoNavegacion {
  pedidoCreado?: number
}

export default function MisPedidosPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const location = useLocation()
  const pedidoCreado = (location.state as EstadoNavegacion | null)?.pedidoCreado
  const [avisoVisible, setAvisoVisible] = useState(true)

  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [pagina, setPagina] = useState(0)
  // Se guardan ids y no objetos: así el modal muestra los datos frescos después de invalidar la query.
  const [idDetalle, setIdDetalle] = useState<number | null>(null)
  const [idACancelar, setIdACancelar] = useState<number | null>(null)
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = usePedidos({
    skip: pagina * TAMANIO_PAGINA,
    limit: TAMANIO_PAGINA,
    estado: estado || undefined,
  })
  const cancelar = useCancelarPedido()

  const detalle = data?.items.find((p) => p.id === idDetalle)
  const aCancelar = data?.items.find((p) => p.id === idACancelar)

  // El backend igual rechaza con 403/400; esto solo evita mostrar un botón que no va a funcionar.
  const esCancelable = (pedido: Pedido) => pedido.estado === 'PENDIENTE' && pedido.usuario_id === usuario?.id

  const abrirCancelacion = (id: number) => {
    setErrorCancelacion(null)
    setIdDetalle(null)
    setIdACancelar(id)
  }

  const confirmarCancelacion = async () => {
    if (idACancelar === null) return
    try {
      await cancelar.mutateAsync(idACancelar)
      setIdACancelar(null)
    } catch (e) {
      setErrorCancelacion(handleApiError(e, 'No se pudo cancelar el pedido'))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mis pedidos</h1>
          <p className="text-sm text-stone-500">
            {usuario?.role === 'admin'
              ? 'Como administrador ves los pedidos de todos; avanzalos desde el panel'
              : 'Seguí el estado de tus compras'}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-estado" className="text-xs font-medium text-stone-600">
            Filtrar por estado
          </label>
          <select
            id="filtro-estado"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as EstadoPedido | '')
              setPagina(0)
            }}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {OPCIONES_FILTRO_ESTADO.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.texto}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pedidoCreado !== undefined && avisoVisible && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>¡Listo! Tu pedido #{pedidoCreado} quedó registrado y está pendiente de preparación.</span>
          <Button variante="fantasma" tamanio="sm" onClick={() => setAvisoVisible(false)}>
            Cerrar
          </Button>
        </div>
      )}

      {isPending ? (
        <SkeletonFilas cantidad={TAMANIO_PAGINA} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los pedidos')} onReintentar={() => void refetch()} />
      ) : data.items.length === 0 ? (
        <EstadoVacio
          titulo={estado ? 'No hay pedidos con ese estado' : 'Todavía no hiciste pedidos'}
          accion={
            !estado && (
              <Link to="/" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                Ir al catálogo
              </Link>
            )
          }
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60' : undefined}>
          <ul className="flex flex-col gap-3">
            {data.items.map((pedido) => (
              <li key={pedido.id}>
                <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
                  <div className="min-w-32">
                    <p className="font-semibold text-stone-900">Pedido #{pedido.id}</p>
                    <p className="text-xs text-stone-500">{formatearFecha(pedido.created_at)}</p>
                  </div>
                  <BadgeEstado estado={pedido.estado} />
                  <p className="min-w-0 flex-1 truncate text-sm text-stone-600">
                    {pedido.items.map((d) => `${d.cantidad}× ${d.nombre_producto}`).join(', ')}
                  </p>
                  <p className="font-bold text-stone-900 tabular-nums">{formatearPrecio(pedido.total)}</p>
                  <div className="flex gap-2">
                    <Button variante="secundario" tamanio="sm" onClick={() => setIdDetalle(pedido.id)}>
                      Ver detalle
                    </Button>
                    {esCancelable(pedido) && (
                      <Button variante="peligro" tamanio="sm" onClick={() => abrirCancelacion(pedido.id)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Paginacion pagina={pagina} tamanioPagina={TAMANIO_PAGINA} total={data.total} onCambiar={setPagina} />
        </div>
      )}

      <Modal abierto={detalle !== undefined} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setIdDetalle(null)} ancho="lg">
        {detalle && (
          <div className="flex flex-col gap-4">
            <PedidoDetalle pedido={detalle} />
            {esCancelable(detalle) && (
              <Button variante="peligro" className="self-end" onClick={() => abrirCancelacion(detalle.id)}>
                Cancelar pedido
              </Button>
            )}
          </div>
        )}
      </Modal>

      <Modal abierto={aCancelar !== undefined} titulo="Cancelar pedido" onCerrar={() => setIdACancelar(null)}>
        {aCancelar && (
          <div className="flex flex-col gap-4 text-sm">
            <p className="text-stone-700">
              ¿Seguro que querés cancelar el pedido <strong>#{aCancelar.id}</strong> por{' '}
              <strong>{formatearPrecio(aCancelar.total)}</strong>? Los productos vuelven al stock y no se puede deshacer.
            </p>
            {errorCancelacion && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
                {errorCancelacion}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variante="secundario" onClick={() => setIdACancelar(null)}>
                Volver
              </Button>
              <Button variante="peligro" cargando={cancelar.isPending} onClick={() => void confirmarCancelacion()}>
                Sí, cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
