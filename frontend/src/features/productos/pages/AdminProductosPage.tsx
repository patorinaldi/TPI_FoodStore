import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DialogoConfirmacion } from '../../../shared/components/DialogoConfirmacion'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto, ProductoCreate, ProductoStockUpdate } from '../types/producto'

// La API pagina con un máximo de 100; para el ABM se trae todo de una vez y la tabla pagina en el cliente.
const FILTROS_ADMIN = { skip: 0, limit: 100 }

type EstadoModal =
  | { tipo: 'crear' }
  | { tipo: 'editar'; producto: Producto }
  | { tipo: 'stock'; producto: Producto }
  | null

export default function AdminProductosPage() {
  const { data, isPending, isError, error, refetch } = useProductos(FILTROS_ADMIN)
  const { data: categorias = [] } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const actualizarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const [modal, setModal] = useState<EstadoModal>(null)
  const [aEliminar, setAEliminar] = useState<Producto | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)
  const cerrarModal = () => setModal(null)

  const guardarProducto = async (valores: ProductoCreate) => {
    if (modal?.tipo === 'editar') {
      const { nombre, categoria_id, precio_base, descripcion, imagen_url, disponible } = valores
      await actualizar.mutateAsync({
        id: modal.producto.id,
        cambios: { nombre, categoria_id, precio_base, descripcion, imagen_url, disponible },
      })
    } else {
      await crear.mutateAsync(valores)
    }
    cerrarModal()
  }

  const guardarStock = async (valores: ProductoStockUpdate) => {
    if (modal?.tipo !== 'stock') return
    await actualizarStock.mutateAsync({ id: modal.producto.id, stock: valores })
    cerrarModal()
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await eliminar.mutateAsync(aEliminar.id)
      setAEliminar(null)
    } catch (e) {
      setErrorEliminar(handleApiError(e, 'No se pudo eliminar el producto'))
    }
  }

  const columnas: ColumnDef<Producto>[] = [
    {
      accessorKey: 'nombre',
      header: 'Producto',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
            {row.original.imagen_url && <img src={row.original.imagen_url} alt="" className="size-full object-cover" />}
          </div>
          <span className="font-medium text-stone-900">{row.original.nombre}</span>
        </div>
      ),
    },
    { id: 'categoria', accessorFn: (p) => p.categoria.nombre, header: 'Categoría' },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: ({ row }) => <span className="tabular-nums">{formatearPrecio(row.original.precio_base)}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => (
        <span className={`tabular-nums ${row.original.stock === 0 ? 'font-semibold text-red-600' : ''}`}>
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: 'disponible',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.disponible ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Disponible</span>
        ) : (
          <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-700">No disponible</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variante="secundario" tamanio="sm" onClick={() => setModal({ tipo: 'stock', producto: row.original })}>
            Stock
          </Button>
          <Button variante="secundario" tamanio="sm" onClick={() => setModal({ tipo: 'editar', producto: row.original })}>
            Editar
          </Button>
          <Button
            variante="peligro"
            tamanio="sm"
            onClick={() => {
              setErrorEliminar(null)
              setAEliminar(row.original)
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const tituloModal = { crear: 'Nuevo producto', editar: 'Editar producto', stock: 'Stock y disponibilidad' }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Productos</h1>
          <p className="text-sm text-stone-500">Alta, edición, baja y control de stock</p>
        </div>
        <Button onClick={() => setModal({ tipo: 'crear' })} disabled={categorias.length === 0}>
          + Nuevo producto
        </Button>
      </div>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los productos')} onReintentar={() => void refetch()} />
      ) : (
        <>
          <TablaDatos
            datos={data.items}
            columnas={columnas}
            placeholderFiltro="Filtrar por nombre o categoría…"
            mensajeVacio="Todavía no hay productos"
          />
          {data.total > data.items.length && (
            <p className="text-xs text-stone-500">
              Se muestran los primeros {data.items.length} de {data.total} productos.
            </p>
          )}
        </>
      )}

      <Modal abierto={modal !== null} titulo={modal ? tituloModal[modal.tipo] : ''} onCerrar={cerrarModal} ancho="lg">
        {modal?.tipo === 'stock' ? (
          <StockForm producto={modal.producto} onGuardar={guardarStock} onCancelar={cerrarModal} />
        ) : (
          <ProductoForm
            inicial={modal?.tipo === 'editar' ? modal.producto : undefined}
            categorias={categorias}
            onGuardar={guardarProducto}
            onCancelar={cerrarModal}
          />
        )}
      </Modal>

      <DialogoConfirmacion
        abierto={aEliminar !== null}
        titulo="Eliminar producto"
        textoConfirmar="Sí, eliminar"
        cargando={eliminar.isPending}
        error={errorEliminar}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      >
        ¿Eliminar <strong>{aEliminar?.nombre}</strong>? Deja de aparecer en el catálogo; los pedidos ya hechos conservan
        su nombre y precio.
      </DialogoConfirmacion>
    </div>
  )
}
