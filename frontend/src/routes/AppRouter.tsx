import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import UnauthorizedPage from '../features/auth/pages/UnauthorizedPage'
import CarritoPage from '../features/pedidos/pages/CarritoPage'
import CheckoutPage from '../features/pedidos/pages/CheckoutPage'
import MisPedidosPage from '../features/pedidos/pages/MisPedidosPage'
import CatalogoPage from '../features/productos/pages/CatalogoPage'
import { MainLayout } from '../shared/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'

// El panel va en chunks aparte: un cliente nunca descarga el código de las pantallas de administración.
const AdminResumenPage = lazy(() => import('../features/pedidos/pages/AdminResumenPage'))
const AdminCategoriasPage = lazy(() => import('../features/categorias/pages/AdminCategoriasPage'))
const AdminProductosPage = lazy(() => import('../features/productos/pages/AdminProductosPage'))
const AdminPedidosPage = lazy(() => import('../features/pedidos/pages/AdminPedidosPage'))
const AdminUsuariosPage = lazy(() => import('../features/usuarios/pages/AdminUsuariosPage'))

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
