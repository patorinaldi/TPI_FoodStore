import axios from 'axios'

interface ErrorDeValidacion {
  loc: (string | number)[]
  msg: string
}

interface CuerpoDeError {
  detail?: string | ErrorDeValidacion[]
}

export function handleApiError(error: unknown, mensajePorDefecto = 'Ocurrió un error inesperado'): string {
  if (!axios.isAxiosError<CuerpoDeError>(error)) {
    return mensajePorDefecto
  }
  if (!error.response) {
    return 'No se pudo conectar con el servidor'
  }
  const detail = error.response.data?.detail
  if (typeof detail === 'string') {
    return detail
  }
  if (Array.isArray(detail)) {
    return detail.map((e) => `${String(e.loc.at(-1))}: ${e.msg}`).join('. ')
  }
  return mensajePorDefecto
}
