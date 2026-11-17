import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Select, TextArea } from '../../../shared/ui/Input'
import { formatearPrecio } from '../../../shared/utils/formato'
import { errorDeCampo } from '../../../shared/utils/formulario'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types/pedido'

const FORMAS_PAGO: { valor: FormaPago; texto: string }[] = [
  { valor: 'EFECTIVO', texto: 'Efectivo' },
  { valor: 'TRANSFERENCIA', texto: 'Transferencia' },
]

interface ValoresCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [confirmado, setConfirmado] = useState(false)

  const valoresIniciales: ValoresCheckout = { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' }

  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        const pedido = await crearPedido.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        })
        // React Router hace la navegación dentro de una transición, así que el render del carrito vacío
        // llega antes; el flag evita que ese render redirija a /carrito.
        setConfirmado(true)
        vaciar()
        navigate('/mis-pedidos', { replace: true, state: { pedidoCreado: pedido.id } })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo crear el pedido'))
      }
    },
  })

  if (items.length === 0) return confirmado ? null : <Navigate to="/carrito" replace />

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-stone-900">Confirmar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const largo = value.trim().length
                  if (largo === 0) return 'Ingresá la dirección de entrega'
                  if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
                  if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
                  return undefined
                },
              }}
            >
              {(field) => (
                <TextArea
                  id={field.name}
                  label="Dirección de entrega"
                  rows={2}
                  autoComplete="street-address"
                  placeholder="Calle, número, piso, depto."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorDeCampo(field.state.meta)}
                />
              )}
            </form.Field>

            <form.Field name="forma_pago">
              {(field) => (
                <Select
                  id={field.name}
                  label="Forma de pago"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                >
                  {FORMAS_PAGO.map((f) => (
                    <option key={f.valor} value={f.valor}>
                      {f.texto}
                    </option>
                  ))}
                </Select>
              )}
            </form.Field>

            <form.Field
              name="notas"
              validators={{
                onChange: ({ value }) =>
                  value.length > 500 ? 'Las notas no pueden superar los 500 caracteres' : undefined,
              }}
            >
              {(field) => (
                <TextArea
                  id={field.name}
                  label="Notas (opcional)"
                  rows={3}
                  placeholder="Ej.: sin cebolla, tocar timbre B"
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

            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
              {([puedeEnviar, enviando]) => (
                <Button type="submit" disabled={!puedeEnviar} cargando={enviando}>
                  Confirmar pedido · {formatearPrecio(total)}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="mb-3 font-semibold text-stone-900">Tu pedido</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-3">
                <span className="text-stone-700">
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium text-stone-900 tabular-nums">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-lg font-bold text-stone-900">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
