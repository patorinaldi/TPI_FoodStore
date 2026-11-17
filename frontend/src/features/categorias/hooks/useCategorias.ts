import { useQuery } from '@tanstack/react-query'

import { listarCategorias } from '../api/categorias'

export const CLAVE_CATEGORIAS = ['categorias'] as const

export function useCategorias() {
  return useQuery({ queryKey: CLAVE_CATEGORIAS, queryFn: listarCategorias })
}
