import axios from 'axios'

export const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

// En estas dos rutas un 401 es una respuesta esperada (credenciales malas o
// visitante sin sesión), no una sesión que se venció.
const RUTAS_SIN_INTERCEPTOR = ['/auth/token', '/auth/me']

let alInvalidarSesion: () => void = () => {}

/** El authStore registra acá cómo limpiar la sesión; así shared/ no depende del store. */
export function registrarSesionInvalida(handler: () => void): void {
  alInvalidarSesion = handler
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const sesionVencida = status === 401 && !RUTAS_SIN_INTERCEPTOR.some((ruta) => url.endsWith(ruta))
      const cuentaDesactivada = status === 400 && data?.detail === CUENTA_DESACTIVADA
      if (sesionVencida || cuentaDesactivada) {
        alInvalidarSesion()
      }
    }
    return Promise.reject(error)
  },
)
