import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { EMAIL_REGEX, errorDeCampo } from '../../../shared/utils/formulario'
import { useAuthStore } from '../../../store/authStore'
import { registrar } from '../api/auth'

export default function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmacion: '' },
    onSubmit: async ({ value }) => {
      setErrorServidor(null)
      try {
        await registrar({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        await login(value.username.trim(), value.password)
        navigate('/', { replace: true })
      } catch (error) {
        setErrorServidor(handleApiError(error, 'No se pudo completar el registro'))
      }
    },
  })

  if (usuario) return <Navigate to="/" replace />

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-stone-500">Registrate para empezar a pedir</p>
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
            validators={{
              onChange: ({ value }) => {
                const v = value.trim()
                if (v.length < 3) return 'Mínimo 3 caracteres'
                if (v.length > 50) return 'Máximo 50 caracteres'
                return undefined
              },
            }}
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
            name="full_name"
            validators={{ onChange: ({ value }) => (!value.trim() ? 'Ingresá tu nombre' : undefined) }}
          >
            {(field) => (
              <Input
                id={field.name}
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={errorDeCampo(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (!EMAIL_REGEX.test(value.trim()) ? 'Ingresá un email válido' : undefined),
            }}
          >
            {(field) => (
              <Input
                id={field.name}
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={errorDeCampo(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (value.length < 8) return 'Mínimo 8 caracteres'
                if (value.length > 72) return 'Máximo 72 caracteres'
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                id={field.name}
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={errorDeCampo(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="confirmacion"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password') ? 'Las contraseñas no coinciden' : undefined,
            }}
          >
            {(field) => (
              <Input
                id={field.name}
                label="Repetir contraseña"
                type="password"
                autoComplete="new-password"
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
                Crear cuenta
              </Button>
            )}
          </form.Subscribe>
        </form>
      </Card>

      <p className="text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-orange-700 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
