import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { errorDeCampo } from '../../../shared/utils/formulario'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockFormProps {
  producto: Producto
  onGuardar: (valores: ProductoStockUpdate) => Promise<unknown>
  onCancelar: () => void
}

export function StockForm({ producto, onGuardar, onCancelar }: StockFormProps) {
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await onGuardar({ stock: Number(value.stock), disponible: value.disponible })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo actualizar el stock'))
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
      <p className="text-sm text-stone-600">
        Stock actual de <strong>{producto.nombre}</strong>: {producto.stock} unidades.
      </p>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            /^\d+$/.test(value.trim()) ? undefined : 'El stock tiene que ser un entero mayor o igual a 0',
        }}
      >
        {(field) => (
          <Input
            id="stock-cantidad"
            label="Nuevo stock"
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

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              id="stock-disponible"
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
              Actualizar stock
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
