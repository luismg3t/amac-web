import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function EnlaceNav({ enlace, children }) {
  const { cerrarSesion } = useAuth()
  const navegar = useNavigate()

  if (enlace.salir) {
    async function salir(evento) {
      evento.preventDefault()
      await cerrarSesion()
      navegar('/login')
    }

    return (
      <a href={enlace.to} onClick={salir}>
        {children}
      </a>
    )
  }

  return (
    <NavLink to={enlace.to} end={enlace.fin}>
      {children}
    </NavLink>
  )
}
