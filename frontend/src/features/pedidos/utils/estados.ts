import type { EstadoPedido } from '../types/pedido'

export const OPCIONES_FILTRO_ESTADO: { valor: EstadoPedido | ''; texto: string }[] = [
  { valor: '', texto: 'Todos los estados' },
  { valor: 'PENDIENTE', texto: 'Pendiente' },
  { valor: 'EN_PREPARACION', texto: 'En preparación' },
  { valor: 'ENTREGADO', texto: 'Entregado' },
  { valor: 'CANCELADO', texto: 'Cancelado' },
]

// Copia de TRANSICIONES del service de pedidos: solo decide qué botones mostrar, la validación real es del backend.
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export const TEXTO_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Volver a pendiente',
  EN_PREPARACION: 'Pasar a preparación',
  ENTREGADO: 'Marcar entregado',
  CANCELADO: 'Cancelar',
}
