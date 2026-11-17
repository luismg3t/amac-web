import Boton from './Boton'
import Icono from './Icono'
import { formatearSueldo } from '../lib/formato'

export default function TarjetaVacante({ vacante }) {
  return (
    <article className="tarjeta-vacante">
      <h2 className="tarjeta-vacante__titulo">{vacante.titulo}</h2>
      <ul className="tarjeta-vacante__datos">
        <li className="tarjeta-vacante__dato">
          <Icono nombre="empresa" className="tarjeta-vacante__icono" />
          <span>Empresa: {vacante.empresa?.nombre ?? 'Sin nombre'}</span>
        </li>
        <li className="tarjeta-vacante__dato">
          <Icono nombre="ubicacion" className="tarjeta-vacante__icono" />
          <span>Ubicación: {vacante.ubicacion}</span>
        </li>
        <li className="tarjeta-vacante__dato">
          <Icono nombre="reloj" className="tarjeta-vacante__icono" />
          <span>Horario: {vacante.horario}</span>
        </li>
        <li className="tarjeta-vacante__dato tarjeta-vacante__dato--destacado">
          <Icono nombre="dinero" className="tarjeta-vacante__icono" />
          <span>Sueldo: {formatearSueldo(vacante.sueldo)}</span>
        </li>
      </ul>
      <Boton bloque to={`/vacantes/${vacante.id}`}>
        Ver vacante<span className="visualmente-oculto"> de {vacante.titulo}</span>
      </Boton>
    </article>
  )
}
