import { api } from '../../../shared/api/axiosInstance'
import type { MensajeResponse, UserCreate, UserPublic } from '../types/auth'

export async function login(username: string, password: string): Promise<MensajeResponse> {
  // El endpoint usa OAuth2PasswordRequestForm: espera un formulario, no JSON.
  const form = new URLSearchParams({ username, password })
  const { data } = await api.post<MensajeResponse>('/auth/token', form)
  return data
}

export async function logout(): Promise<MensajeResponse> {
  const { data } = await api.post<MensajeResponse>('/auth/logout')
  return data
}

export async function obtenerUsuarioActual(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>('/auth/me')
  return data
}

export async function registrar(usuario: UserCreate): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>('/auth/register', usuario)
  return data
}
