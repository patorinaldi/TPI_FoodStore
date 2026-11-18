import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input, TextArea } from '../../../shared/ui/Input'
import { errorDeCampo } from '../../../shared/utils/formulario'
import type { Categoria, CategoriaCreate } from '../types/categoria'

interface CategoriaFormProps {
  inicial?: Categoria
  onGuardar: (valores: CategoriaCreate) => Promise<unknown>
  onCancelar: () => void
}

export function CategoriaForm({ inicial, onGuardar, onCancelar }: CategoriaFormProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? '', descripcion: inicial?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await onGuardar({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo guardar la categoría'))
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
            if (largo > 100) return 'El nombre no puede superar los 100 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            id="categoria-nombre"
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="descripcion"
        validators={{
          onChange: ({ value }) => (value.length > 500 ? 'La descripción no puede superar los 500 caracteres' : undefined),
        }}
      >
        {(field) => (
          <TextArea
            id="categoria-descripcion"
            label="Descripción (opcional)"
            rows={3}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field.state.meta)}
          />
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
              {inicial ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
