import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input, Select, TextArea } from '../../../shared/ui/Input'
import { errorDeCampo } from '../../../shared/utils/formulario'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoCreate } from '../types/producto'

interface ProductoFormProps {
  inicial?: Producto
  categorias: Categoria[]
  onGuardar: (valores: ProductoCreate) => Promise<unknown>
  onCancelar: () => void
}

// Los inputs numéricos se manejan como texto para poder distinguir "vacío" de 0 y validar el formato.
interface ValoresProducto {
  nombre: string
  categoria_id: string
  precio_base: string
  stock: string
  descripcion: string
  imagen_url: string
  disponible: boolean
}

export function ProductoForm({ inicial, categorias, onGuardar, onCancelar }: ProductoFormProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const editando = inicial !== undefined

  const valoresIniciales: ValoresProducto = {
    nombre: inicial?.nombre ?? '',
    categoria_id: inicial ? String(inicial.categoria_id) : '',
    precio_base: inicial ? String(inicial.precio_base) : '',
    stock: inicial ? String(inicial.stock) : '0',
    descripcion: inicial?.descripcion ?? '',
    imagen_url: inicial?.imagen_url ?? '',
    disponible: inicial?.disponible ?? true,
  }

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await onGuardar({
          nombre: value.nombre.trim(),
          categoria_id: Number(value.categoria_id),
          precio_base: Number(value.precio_base),
          stock: Number(value.stock),
          descripcion: value.descripcion.trim() || null,
          imagen_url: value.imagen_url.trim() || null,
          disponible: value.disponible,
        })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo guardar el producto'))
      }
    },
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 2) return 'El nombre debe tener al menos 2 caracteres'
            if (largo > 150) return 'El nombre no puede superar los 150 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            id="producto-nombre"
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="categoria_id"
          validators={{ onChange: ({ value }) => (!value ? 'Elegí una categoría' : undefined) }}
        >
          {(field) => (
            <Select
              id="producto-categoria"
              label="Categoría"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            >
              <option value="">Seleccioná…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          )}
        </form.Field>

        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return 'Ingresá el precio'
              const precio = Number(value)
              if (Number.isNaN(precio) || precio < 0) return 'El precio tiene que ser un número mayor o igual a 0'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              id="producto-precio"
              label="Precio ($)"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>
      </div>

      {/* Al editar, el stock se cambia desde su propio modal para no pisar ventas que entraron mientras tanto. */}
      {!editando && (
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              /^\d+$/.test(value.trim()) ? undefined : 'El stock tiene que ser un entero mayor o igual a 0',
          }}
        >
          {(field) => (
            <Input
              id="producto-stock"
              label="Stock inicial"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>
      )}

      <form.Field
        name="descripcion"
        validators={{
          onChange: ({ value }) => (value.length > 1000 ? 'La descripción no puede superar los 1000 caracteres' : undefined),
        }}
      >
        {(field) => (
          <TextArea
            id="producto-descripcion"
            label="Descripción (opcional)"
            rows={2}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="imagen_url"
        validators={{
          onChange: ({ value }) => {
            const url = value.trim()
            if (!url) return undefined
            if (!/^https?:\/\/\S+$/.test(url)) return 'Tiene que ser una URL que empiece con http:// o https://'
            if (url.length > 500) return 'La URL no puede superar los 500 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            id="producto-imagen"
            label="URL de la imagen (opcional)"
            type="url"
            placeholder="https://…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              id="producto-disponible"
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 accent-orange-600"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      {errorServidor && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorServidor}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeEnviar, enviando]) => (
            <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
              {editando ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
