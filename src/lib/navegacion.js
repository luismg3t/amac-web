export function enlacesPara(sesion, perfil) {
  const enlaces = [{ to: '/', texto: 'Vacantes', icono: 'maletin', fin: true }]

  if (perfil?.rol === 'empresa') {
    enlaces.push({ to: '/empresa/vacantes', texto: 'Mis vacantes', icono: 'documento' })
  } else if (!perfil || perfil.rol === 'candidato') {
    enlaces.push({ to: '/mis-solicitudes', texto: 'Mis solicitudes', icono: 'documento' })
  }

  if (sesion) {
    enlaces.push({ to: '/login', texto: 'Cerrar sesión', icono: 'persona', salir: true })
  } else {
    enlaces.push({ to: '/login', texto: 'Iniciar sesión', icono: 'persona' })
  }

  return enlaces
}
