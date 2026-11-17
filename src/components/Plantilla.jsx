import { Outlet } from 'react-router-dom'

export default function Plantilla() {
  return (
    <>
      <a className="saltar-contenido" href="#principal">
        Saltar al contenido
      </a>
      <main id="principal" className="contenido contenedor">
        <Outlet />
      </main>
    </>
  )
}
