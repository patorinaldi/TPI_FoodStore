import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DialogoConfirmacion } from '../../../shared/components/DialogoConfirmacion'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import { useUsuarios } from '../../usuarios/hooks/useUsuarios'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types/pedido'
import { OPCIONES_FILTRO_ESTADO, TEXTO_ACCION, TRANSICIONES } from '../utils/estados'

const TAMANIO_PAGINA = 10

interface Cambio {
  pedido: Pedido
  estado: EstadoPedido
}

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const [pagina, setPagina] = useState(0)
  const [idDetalle, setIdDetalle] = useState<number | null>(null)
  const [cancelacion, setCancelacion] = useState<Pedido | null>(null)
  const [errorCambio, setErrorCambio] = useState<string | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = usePedidos({
    skip: pagina * TAMANIO_PAGINA,
    limit: TAMANIO_PAGINA,
    estado: estado || undefined,
  })
  const { data: usuarios } = useUsuarios()
  const cambiarEstado = useCambiarEstadoPedido()

  const nombreCliente = (usuarioId: number) => {
    const usuario = usuarios?.find((u) => u.id === usuarioId)
    return usuario ? usuario.full_name : `Usuario #${usuarioId}`
  }
  const detalle = data?.items.find((p) => p.id === idDetalle)

  const aplicarCambio = async ({ pedido, estado: nuevo }: Cambio) => {
    setErrorCambio(null)
    try {
      await cambiarEstado.mutateAsync({ id: pedido.id, estado: nuevo })
      setCancelacion(null)
    } catch (e) {
      setErrorCambio(handleApiError(e, 'No se pudo cambiar el estado del pedido'))
    }
  }

  // Cancelar devuelve stock y no tiene vuelta atrás, así que pide confirmación; avanzar se aplica directo.
  const solicitarCambio = (pedido: Pedido, nuevo: EstadoPedido) => {
    if (nuevo === 'CANCELADO') {
      setErrorCambio(null)
      setIdDetalle(null)
      setCancelacion(pedido)
    } else {
      void aplicarCambio({ pedido, estado: nuevo })
    }
  }

  const procesando = (id: number) => cambiarEstado.isPending && cambiarEstado.variables?.id === id

  const botonesTransicion = (pedido: Pedido) =>
    TRANSICIONES[pedido.estado].map((nuevo) => (
      <Button
        key={nuevo}
        tamanio="sm"
        variante={nuevo === 'CANCELADO' ? 'peligro' : 'primario'}
        disabled={procesando(pedido.id)}
        cargando={procesando(pedido.id) && cambiarEstado.variables?.estado === nuevo}
        onClick={() => solicitarCambio(pedido, nuevo)}
      >
        {TEXTO_ACCION[nuevo]}
      </Button>
    ))

  const columnas: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: '#', cell: ({ row }) => <span className="font-medium">#{row.original.id}</span> },
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) => <span className="whitespace-nowrap">{formatearFecha(row.original.created_at)}</span>,
    },
    { id: 'cliente', accessorFn: (p) => nombreCliente(p.usuario_id), header: 'Cliente' },
    {
      id: 'items',
      header: 'Productos',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-56 text-stone-600">
          {row.original.items.map((d) => `${d.cantidad}× ${d.nombre_producto}`).join(', ')}
        </span>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatearPrecio(row.original.total)}</span>,
    },
    { accessorKey: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variante="secundario" tamanio="sm" onClick={() => setIdDetalle(row.original.id)}>
            Ver
          </Button>
          {botonesTransicion(row.original)}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Pedidos</h1>
          <p className="text-sm text-stone-500">Avanzá los pedidos por su ciclo: pendiente → en preparación → entregado</p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="admin-filtro-estado" className="text-xs font-medium text-stone-600">
            Filtrar por estado
          </label>
          <select
            id="admin-filtro-estado"
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

      {errorCambio && cancelacion === null && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorCambio}
        </p>
      )}

      {isPending ? (
        <SkeletonFilas cantidad={TAMANIO_PAGINA} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los pedidos')} onReintentar={() => void refetch()} />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60' : undefined}>
          <TablaDatos
            datos={data.items}
            columnas={columnas}
            paginar={false}
            mensajeVacio={estado ? 'No hay pedidos con ese estado' : 'Todavía no hay pedidos'}
          />
          <Paginacion pagina={pagina} tamanioPagina={TAMANIO_PAGINA} total={data.total} onCambiar={setPagina} />
        </div>
      )}

      <Modal
        abierto={detalle !== undefined}
        titulo={`Pedido #${detalle?.id ?? ''}`}
        onCerrar={() => setIdDetalle(null)}
        ancho="lg"
      >
        {detalle && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-stone-600">
              Cliente: <strong className="text-stone-900">{nombreCliente(detalle.usuario_id)}</strong>
            </p>
            <PedidoDetalle pedido={detalle} />
            <div className="flex justify-end gap-2">
              {botonesTransicion(detalle)}
            </div>
          </div>
        )}
      </Modal>

      <DialogoConfirmacion
        abierto={cancelacion !== null}
        titulo="Cancelar pedido"
        textoConfirmar="Sí, cancelar"
        cargando={cambiarEstado.isPending}
        error={errorCambio}
        onConfirmar={() => cancelacion && void aplicarCambio({ pedido: cancelacion, estado: 'CANCELADO' })}
        onCancelar={() => setCancelacion(null)}
      >
        ¿Cancelar el pedido <strong>#{cancelacion?.id}</strong> de {cancelacion && nombreCliente(cancelacion.usuario_id)}?
        Los productos vuelven al stock y el pedido no se puede reactivar.
      </DialogoConfirmacion>
    </div>
  )
}
