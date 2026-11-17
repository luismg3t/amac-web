export function esCorreo(texto) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto.trim())
}

export function soloDigitos(texto) {
  return texto.replace(/\D/g, '')
}

export function validarCorreo(texto) {
  if (!texto.trim()) return 'Escribe tu correo electrónico.'
  if (!esCorreo(texto)) return 'Escribe un correo válido, por ejemplo nombre@correo.com.'
  return null
}

export function validarTelefono(texto) {
  if (soloDigitos(texto).length !== 10) return 'Escribe los 10 dígitos de tu teléfono.'
  return null
}

export function validarContrasena(texto) {
  if (texto.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  return null
}

export function sinVacios(errores) {
  return Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje))
}

export function mensajeRegistro(error) {
  if (error.code === 'user_already_exists' || /already registered/i.test(error.message ?? '')) {
    return 'Ya existe una cuenta con ese correo. Inicia sesión.'
  }
  if (error.code === 'weak_password') {
    return 'La contraseña es muy corta o muy sencilla. Elige otra.'
  }
  if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
    return 'Se hicieron muchos intentos. Espera unos minutos y vuelve a intentar.'
  }
  return 'No se pudo crear la cuenta. Revisa tus datos e intenta de nuevo.'
}
