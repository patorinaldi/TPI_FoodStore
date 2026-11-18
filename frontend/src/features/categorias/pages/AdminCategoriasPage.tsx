import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DialogoConfirmacion } from '../../../shared/components/DialogoConfirmacion'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import type { Categoria, CategoriaCreate } from '../types/categoria'

type EstadoFormulario = { modo: 'crear' } | { modo: 'editar'; categoria: Categoria } | null

export default function AdminCategoriasPage() {
  const { data, isPending, isError, error, refetch } = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [formulario, setFormulario] = useState<EstadoFormulario>(null)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)

  const guardar = async (valores: CategoriaCreate) => {
    if (formulario?.modo === 'editar') {
      await actualizar.mutateAsync({ id: formulario.categoria.id, cambios: valores })
    } else {
      await crear.mutateAsync(valores)
    }
    setFormulario(null)
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await eliminar.mutateAsync(aEliminar.id)
      setAEliminar(null)
    } catch (e) {
      setErrorEliminar(handleApiError(e, 'No se pudo eliminar la categoría'))
    }
  }

  const columnas: ColumnDef<Categoria>[] = [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <span className="font-medium text-stone-900">{row.original.nombre}</span>,
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => row.original.descripcion ?? <span className="text-stone-400">Sin descripción</span>,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variante="secundario"
            tamanio="sm"
            onClick={() => setFormulario({ modo: 'editar', categoria: row.original })}
          >
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categorías</h1>
          <p className="text-sm text-stone-500">Alta, edición y baja de las categorías del catálogo</p>
        </div>
        <Button onClick={() => setFormulario({ modo: 'crear' })}>+ Nueva categoría</Button>
      </div>

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar las categorías')} onReintentar={() => void refetch()} />
      ) : (
        <TablaDatos
          datos={data}
          columnas={columnas}
          placeholderFiltro="Filtrar categorías…"
          mensajeVacio="Todavía no hay categorías"
        />
      )}

      <Modal
        abierto={formulario !== null}
        titulo={formulario?.modo === 'editar' ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={() => setFormulario(null)}
      >
        <CategoriaForm
          inicial={formulario?.modo === 'editar' ? formulario.categoria : undefined}
          onGuardar={guardar}
          onCancelar={() => setFormulario(null)}
        />
      </Modal>

      <DialogoConfirmacion
        abierto={aEliminar !== null}
        titulo="Eliminar categoría"
        textoConfirmar="Sí, eliminar"
        cargando={eliminar.isPending}
        error={errorEliminar}
        onConfirmar={() => void confirmarEliminar()}
        onCancelar={() => setAEliminar(null)}
      >
        ¿Eliminar la categoría <strong>{aEliminar?.nombre}</strong>? Deja de mostrarse en el catálogo, pero el nombre
        queda reservado.
      </DialogoConfirmacion>
    </div>
  )
}
