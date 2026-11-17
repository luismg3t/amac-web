import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ rol, children }) {
  const { sesion, perfil, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) {
    return (
      <p className="introduccion" role="status">
        Cargando…
      </p>
    )
  }

  if (!sesion) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  if (rol && perfil?.rol !== rol) {
    return <Navigate to="/" replace />
  }

  return children
}
