import { api } from '../../../shared/api/axiosInstance'
import type { UserPublic } from '../../auth/types/auth'

export async function listarUsuarios(): Promise<UserPublic[]> {
  const { data } = await api.get<UserPublic[]>('/admin/usuarios')
  return data
}

export async function activarUsuario(id: number): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>(`/admin/usuarios/${id}/activar`)
  return data
}

export async function desactivarUsuario(id: number): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>(`/admin/usuarios/${id}/desactivar`)
  return data
}
