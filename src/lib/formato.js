const moneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const fecha = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatearSueldo(valor) {
  return `${moneda.format(Number(valor))} al mes`
}

export function formatearFecha(valor) {
  return fecha.format(new Date(valor))
}

export function separarLineas(texto) {
  return (texto ?? '')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)
}

export function limpiarBusqueda(texto) {
  return texto.replace(/[,()"\\%*]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function enlaceTelefono(telefono) {
  const digitos = telefono.replace(/\D/g, '')
  return digitos.length === 10 ? `tel:+52${digitos}` : `tel:+${digitos}`
}
