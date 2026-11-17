import { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useConsulta } from '../lib/useConsulta'
import { useTitulo } from '../lib/useTitulo'
import { enlaceTelefono, formatearFecha, formatearSueldo, separarLineas } from '../lib/formato'
import { MENSAJE_NO_APROBADO } from '../lib/catalogos'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import Icono from '../components/Icono'

function Lista({ lineas }) {
  return (
    <ul className="lista-detalle">
      {lineas.map((linea, indice) => (
        <li key={indice}>{linea}</li>
      ))}
    </ul>
  )
}

export default function DetalleVacante() {
  const { id } = useParams()
  return <Detalle key={id} id={id} />
}

function Detalle({ id }) {
  const vacanteId = /^\d+$/.test(id) ? Number(id) : null
  const { pathname } = useLocation()
  const { sesion, perfil } = useAuth()
  const usuarioId = sesion?.user?.id ?? null
  const esCandidato = perfil?.rol === 'candidato'

  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const { cargando, datos: vacante } = useConsulta(() => {
    if (vacanteId === null) return { data: null, error: null }
    return supabase.from('vacantes').select('*, empresa:perfiles!vacantes_empresa_id_fkey(nombre)').eq('id', vacanteId).maybeSingle()
  }, [vacanteId, usuarioId])

  const { datos: solicitudPrevia } = useConsulta(() => {
    if (vacanteId === null || !usuarioId || !esCandidato) return { data: null, error: null }
    return supabase
      .from('solicitudes')
      .select('id, estatus')
      .eq('vacante_id', vacanteId)
      .eq('candidato_id', usuarioId)
      .maybeSingle()
  }, [vacanteId, usuarioId, esCandidato])

  useTitulo(vacante?.titulo ?? 'Vacante')

  async function postular() {
    setMensaje('')
    setEnviando(true)
    const { error } = await supabase.from('solicitudes').insert({ vacante_id: vacante.id, candidato_id: usuarioId })
    setEnviando(false)

    if (!error) {
      setEnviada(true)
    } else if (error.code === '23505') {
      setMensaje('Ya te postulaste a esta vacante.')
    } else if (error.code === '42501') {
      setMensaje(MENSAJE_NO_APROBADO)
    } else {
      setMensaje('No se pudo enviar tu solicitud. Intenta de nuevo.')
    }
  }

  if (cargando) {
    return (
      <p className="introduccion" role="status">
        Cargando vacante…
      </p>
    )
  }

  if (!vacante) {
    return (
      <>
        <Boton variante="secundario" to="/">
          ← Volver a las vacantes
        </Boton>
        <h1>Vacante no disponible</h1>
        <p className="introduccion">Esta vacante no existe o ya no está publicada.</p>
      </>
    )
  }

  let accion = null
  if (enviada) {
    accion = (
      <>
        <p className="etiqueta-estatus etiqueta-estatus--aceptada" role="status">
          Tu solicitud fue enviada
        </p>
        <Boton bloque to="/mis-solicitudes">
          Ver mis solicitudes
        </Boton>
      </>
    )
  } else if (solicitudPrevia) {
    accion = (
      <>
        <p>Ya te postulaste a esta vacante.</p>
        <EtiquetaEstatus valor={solicitudPrevia.estatus} prefijoVisible />
        <Boton bloque to="/mis-solicitudes">
          Ver mis solicitudes
        </Boton>
      </>
    )
  } else if (vacante.estado !== 'activa') {
    accion = <p>Esta vacante ya no recibe solicitudes.</p>
  } else if (!sesion) {
    accion = (
      <>
        <Boton variante="acento" bloque to="/login" state={{ desde: pathname }}>
          Postularme
        </Boton>
        <p className="introduccion">Para postularte necesitas iniciar sesión.</p>
      </>
    )
  } else if (esCandidato) {
    accion = (
      <Boton variante="acento" bloque onClick={postular} disabled={enviando}>
        {enviando ? 'Enviando…' : 'Postularme'}
      </Boton>
    )
  }

  return (
    <>
      <Boton variante="secundario" to="/">
        ← Volver a las vacantes
      </Boton>
      <h1>{vacante.titulo}</h1>
      <p className="introduccion introduccion--grande">
        {vacante.empresa?.nombre ?? 'Empresa'} · {vacante.ubicacion}
      </p>

      <div className="detalle-vacante">
        <aside className="detalle-vacante__resumen tarjeta" aria-label="Resumen y postulación">
          <p className="detalle-vacante__sueldo">Sueldo: {formatearSueldo(vacante.sueldo)}</p>
          <ul className="detalle-vacante__datos">
            <li>Horario: {vacante.horario}</li>
            <li>Categoría: {vacante.categoria}</li>
            <li>Publicada: {formatearFecha(vacante.creada_en)}</li>
          </ul>
          {accion}
          {mensaje && (
            <p className="campo-formulario__error" role="alert">
              {mensaje}
            </p>
          )}
          {vacante.telefono_contacto && (
            <a className="boton boton--secundario boton--bloque" href={enlaceTelefono(vacante.telefono_contacto)}>
              <Icono nombre="telefono" />
              <span>
                Llamar<span className="visualmente-oculto"> a la empresa</span>
              </span>
            </a>
          )}
          <p className="introduccion">¿Tienes dudas? Toca el botón “Ayuda” de arriba.</p>
        </aside>

        <div className="detalle-vacante__info">
          <section className="tarjeta" aria-labelledby="que-haras">
            <h2 id="que-haras">Qué harás</h2>
            <Lista lineas={separarLineas(vacante.descripcion)} />
          </section>
          <section className="tarjeta" aria-labelledby="requisitos">
            <h2 id="requisitos">Requisitos</h2>
            <Lista lineas={separarLineas(vacante.requisitos)} />
          </section>
          <section className="tarjeta" aria-labelledby="prestaciones">
            <h2 id="prestaciones">Horario y prestaciones</h2>
            <Lista lineas={[`Horario: ${vacante.horario.toLowerCase()}.`, ...separarLineas(vacante.prestaciones)]} />
          </section>
        </div>
      </div>
    </>
  )
}
