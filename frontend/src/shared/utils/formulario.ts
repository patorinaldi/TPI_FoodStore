/** Primer mensaje de error de un campo de TanStack Form, solo si el usuario ya lo tocó. */
export function errorDeCampo(meta: { errors: unknown[]; isTouched: boolean }): string | undefined {
  if (!meta.isTouched) return undefined
  const error = meta.errors.find((e) => typeof e === 'string')
  return typeof error === 'string' ? error : undefined
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
