import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { enlacesPara } from '../lib/navegacion'
import { TELEFONO_AYUDA } from '../lib/catalogos'
import EnlaceNav from './EnlaceNav'
import Icono from './Icono'

export default function Encabezado() {
  const { sesion, perfil } = useAuth()
  const enlaces = enlacesPara(sesion, perfil)

  return (
    <header className="encabezado">
      <div className="contenedor encabezado__interior">
        <Link className="encabezado__logo" to="/">
          <img src="/img/logo-amac.svg" alt="AMAC asociAMayores, ir al inicio" width="947" height="182" />
        </Link>
        <nav className="nav-principal" aria-label="Navegación principal">
          <ul>
            {enlaces.map((enlace) => (
              <li key={enlace.texto}>
                <EnlaceNav enlace={enlace}>{enlace.texto}</EnlaceNav>
              </li>
            ))}
          </ul>
        </nav>
        <a className="boton boton--ayuda boton--flotante" href={`tel:${TELEFONO_AYUDA}`} aria-label="Ayuda: llamar a AMAC">
          <Icono nombre="telefono" />
          <span>Ayuda</span>
        </a>
      </div>
    </header>
  )
}
