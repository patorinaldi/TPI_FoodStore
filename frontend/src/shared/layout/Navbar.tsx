import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const ENLACES_ADMIN = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

function claseEnlace({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-orange-100 text-orange-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`
}

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadEnCarrito = useCartStore((s) => s.cantidadTotal())
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-orange-700">
          <img src="/favicon.svg" alt="" className="size-7" />
          Food Store
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseEnlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseEnlace}>
            Carrito
            {cantidadEnCarrito > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs text-white">
                {cantidadEnCarrito}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseEnlace}>
              Mis pedidos
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-medium text-stone-800">{usuario.full_name}</p>
                <p className="text-xs text-stone-500">{usuario.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              </div>
              <Button variante="secundario" tamanio="sm" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-stone-700 hover:text-orange-700">
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      {usuario?.role === 'admin' && (
        <div className="border-t border-stone-100 bg-stone-50">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-1.5" aria-label="Panel de administración">
            <span className="mr-2 text-xs font-semibold tracking-wide text-stone-400 uppercase">Panel</span>
            {ENLACES_ADMIN.map((enlace) => (
              <NavLink key={enlace.to} to={enlace.to} className={claseEnlace}>
                {enlace.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
