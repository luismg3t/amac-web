import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Encabezado from './Encabezado'
import Pie from './Pie'

export default function Plantilla() {
  const { pathname } = useLocation()
  const principal = useRef(null)
  const rutaAnterior = useRef(pathname)

  useEffect(() => {
    if (rutaAnterior.current === pathname) return
    rutaAnterior.current = pathname
    window.scrollTo(0, 0)
    principal.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a className="saltar-contenido" href="#principal">
        Saltar al contenido
      </a>
      <Encabezado />
      <main id="principal" className="contenido contenedor" tabIndex={-1} style={{ outline: 'none' }} ref={principal}>
        <Outlet />
      </main>
      <Pie />
    </>
  )
}
