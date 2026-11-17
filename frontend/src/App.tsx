import { useEffect } from 'react'

import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Único useEffect de la app: confirmar contra /auth/me que la cookie sigue vigente.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
