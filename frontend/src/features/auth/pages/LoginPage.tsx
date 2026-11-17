import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { errorDeCampo } from '../../../shared/utils/formulario'
import { useAuthStore } from '../../../store/authStore'

interface EstadoNavegacion {
  desde?: string
}

export default function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as EstadoNavegacion | null)?.desde ?? '/'
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await login(value.username.trim(), value.password)
        navigate(destino, { replace: true })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo iniciar sesión'))
      }
    },
  })

  if (usuario) return <Navigate to={destino} replace />

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-stone-500">Ingresá para hacer tus pedidos</p>
      </div>

      <Card className="p-6">
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (!value.trim() ? 'Ingresá tu usuario' : undefined) }}
          >
            {(field) => (
              <Input
                id={field.name}
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={errorDeCampo(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (!value ? 'Ingresá tu contraseña' : undefined) }}
          >
            {(field) => (
              <Input
                id={field.name}
                label="Contraseña"
                type="password"
                autoComplete="current-password"
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
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <p className="text-center text-sm text-stone-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-medium text-orange-700 hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  )
}
