import { useAuth } from '../context/AuthContext'
import { enlacesPara } from '../lib/navegacion'
import EnlaceNav from './EnlaceNav'
import Icono from './Icono'

export default function Pie() {
  const { sesion, perfil } = useAuth()
  const enlaces = enlacesPara(sesion, perfil)

  return (
    <>
      <footer className="pie fondo-oscuro">
        <div className="pie__interior">
          <div className="pie__datos">
            <p className="pie__nombre">asociAMayores A.C.</p>
            <address>
              Amatista 107
              <br />
              San Pedro Garza García, N.L.
            </address>
            <a href="mailto:contacto@somosamac.org">contacto@somosamac.org</a>
            <a href="#">Aviso de privacidad</a>
          </div>
          <nav className="pie__nav" aria-label="Enlaces del pie de página">
            <ul>
              {enlaces.map((enlace) => (
                <li key={enlace.texto}>
                  <EnlaceNav enlace={enlace}>{enlace.texto}</EnlaceNav>
                </li>
              ))}
              <li>
                <a href="https://somosamac.org">Quiero donar</a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>

      <nav className="nav-inferior" aria-label="Navegación móvil">
        <ul>
          {enlaces.map((enlace) => (
            <li key={enlace.texto}>
              <EnlaceNav enlace={enlace}>
                <Icono nombre={enlace.icono} />
                <span>{enlace.texto}</span>
              </EnlaceNav>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
