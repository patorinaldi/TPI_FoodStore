import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import * as authApi from '../features/auth/api/auth'
import type { UserPublic } from '../features/auth/types/auth'
import { registrarSesionInvalida } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: UserPublic | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await authApi.login(username, password)
        const usuario = await authApi.obtenerUsuarioActual()
        queryClient.clear()
        set({ usuario })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          get().limpiarSesion()
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          set({ usuario: await authApi.obtenerUsuarioActual() })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => {
        // Sin esto, el próximo usuario que entre en el mismo navegador vería
        // por un instante los pedidos cacheados del anterior.
        queryClient.clear()
        set({ usuario: null })
      },
    }),
    {
      name: 'foodstore-auth',
      // Solo los datos del usuario: el token vive en la cookie HttpOnly y JS nunca lo ve.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

registrarSesionInvalida(() => useAuthStore.getState().limpiarSesion())
