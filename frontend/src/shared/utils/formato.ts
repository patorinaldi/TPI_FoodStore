const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
const fechaHora = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export function formatearPrecio(valor: number): string {
  return moneda.format(valor)
}

export function formatearFecha(iso: string): string {
  return fechaHora.format(new Date(iso))
}
