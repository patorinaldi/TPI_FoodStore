import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { DialogoConfirmacion } from '../../../shared/components/DialogoConfirmacion'
import { EstadoError } from '../../../shared/components/EstadoError'
import { SkeletonFilas } from '../../../shared/components/Skeleton'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { Button } from '../../../shared/ui/Button'
import { formatearFecha } from '../../../shared/utils/formato'
import { useAuthStore } from '../../../store/authStore'
import type { UserPublic } from '../../auth/types/auth'
import { useCambiarEstadoUsuario, useUsuarios } from '../hooks/useUsuarios'

export default function AdminUsuariosPage() {
  const sesion = useAuthStore((s) => s.usuario)
  const { data, isPending, isError, error, refetch } = useUsuarios()
  const cambiarEstado = useCambiarEstadoUsuario()

  const [aDesactivar, setADesactivar] = useState<UserPublic | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const aplicar = async (usuario: UserPublic, activar: boolean) => {
    setErrorAccion(null)
    try {
      await cambiarEstado.mutateAsync({ id: usuario.id, activar })
      setADesactivar(null)
    } catch (e) {
      setErrorAccion(handleApiError(e, 'No se pudo cambiar el estado del usuario'))
    }
  }

  const procesando = (id: number) => cambiarEstado.isPending && cambiarEstado.variables?.id === id

  const columnas: ColumnDef<UserPublic>[] = [
    {
      accessorKey: 'username',
      header: 'Usuario',
      cell: ({ row }) => (
        <span className="font-medium text-stone-900">
          {row.original.username}
          {row.original.id === sesion?.id && <span className="ml-1.5 text-xs font-normal text-stone-500">(vos)</span>}
        </span>
      ),
    },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => (row.original.role === 'admin' ? 'Administrador' : 'Cliente'),
    },
    {
      accessorKey: 'created_at',
      header: 'Alta',
      cell: ({ row }) => <span className="whitespace-nowrap">{formatearFecha(row.original.created_at)}</span>,
    },
    {
      accessorKey: 'disabled',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Desactivado</span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Activo</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const usuario = row.original
        // El backend rechaza la autodesactivación con 400; acá directamente no se ofrece.
        if (usuario.id === sesion?.id) return null
        return usuario.disabled ? (
          <Button variante="secundario" tamanio="sm" cargando={procesando(usuario.id)} onClick={() => void aplicar(usuario, true)}>
            Activar
          </Button>
        ) : (
          <Button
            variante="peligro"
            tamanio="sm"
            onClick={() => {
              setErrorAccion(null)
              setADesactivar(usuario)
            }}
          >
            Desactivar
          </Button>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Usuarios</h1>
        <p className="text-sm text-stone-500">Un usuario desactivado no puede iniciar sesión ni operar</p>
      </div>

      {errorAccion && !aDesactivar && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorAccion}
        </p>
      )}

      {isPending ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los usuarios')} onReintentar={() => void refetch()} />
      ) : (
        <TablaDatos datos={data} columnas={columnas} placeholderFiltro="Filtrar por usuario, nombre o email…" />
      )}

      <DialogoConfirmacion
        abierto={aDesactivar !== null}
        titulo="Desactivar usuario"
        textoConfirmar="Sí, desactivar"
        cargando={cambiarEstado.isPending}
        error={errorAccion}
        onConfirmar={() => aDesactivar && void aplicar(aDesactivar, false)}
        onCancelar={() => setADesactivar(null)}
      >
        ¿Desactivar a <strong>{aDesactivar?.full_name}</strong> ({aDesactivar?.username})? Si tiene una sesión abierta, se
        le cierra en el próximo pedido que haga al servidor.
      </DialogoConfirmacion>
    </div>
  )
}
