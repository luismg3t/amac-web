import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useConsulta } from '../lib/useConsulta'
import { useTitulo } from '../lib/useTitulo'
import { formatearFecha } from '../lib/formato'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'

const RESPUESTAS = [
  { estatus: 'En revisión', texto: 'Poner en revisión' },
  { estatus: 'Aceptada', texto: 'Aceptar' },
  { estatus: 'Rechazada', texto: 'Rechazar' },
]

export default function SolicitudesRecibidas() {
  const { id } = useParams()
  const vacanteId = /^\d+$/.test(id) ? Number(id) : null
  const { sesion } = useAuth()
  const usuarioId = sesion.user.id
  const [aviso, setAviso] = useState(null)
  const [cambiando, setCambiando] = useState(null)

  const { cargando: cargandoVacante, datos: vacante } = useConsulta(() => {
    if (vacanteId === null) return { data: null, error: null }
    return supabase
      .from('vacantes')
      .select('id, titulo')
      .eq('id', vacanteId)
      .eq('empresa_id', usuarioId)
      .maybeSingle()
  }, [vacanteId, usuarioId])

  const { cargando, datos, error, setDatos } = useConsulta(() => {
    if (vacanteId === null) return { data: [], error: null }
    return supabase
      .from('solicitudes')
      .select('id, estatus, creada_en, candidato:perfiles!solicitudes_candidato_id_fkey(nombre, edad, colonia, experiencia)')
      .eq('vacante_id', vacanteId)
      .neq('estatus', 'Cancelada')
      .order('creada_en', { ascending: true })
  }, [vacanteId])

  useTitulo(vacante ? `Solicitudes de ${vacante.titulo}` : 'Solicitudes recibidas')

  const solicitudes = datos ?? []

  async function responder(solicitud, estatus) {
    const nombre = solicitud.candidato?.nombre ?? 'la persona'
    setAviso(null)
    setCambiando(solicitud.id)
    const { data, error: fallo } = await supabase
      .from('solicitudes')
      .update({ estatus })
      .eq('id', solicitud.id)
      .select('id')
    setCambiando(null)

    if (fallo || data.length === 0) {
      setAviso({ tipo: 'error', texto: 'No se pudo actualizar la solicitud. Es posible que la persona la haya cancelado.' })
      return
    }

    setDatos((previas) => previas.map((previa) => (previa.id === solicitud.id ? { ...previa, estatus } : previa)))
    setAviso({ tipo: 'exito', texto: `La solicitud de ${nombre} ahora está: ${estatus}.` })
  }

  if (cargandoVacante) {
    return (
      <p className="introduccion" role="status">
        Cargando solicitudes…
      </p>
    )
  }

  if (!vacante) {
    return (
      <>
        <Boton variante="secundario" to="/empresa/vacantes">
          ← Volver a mis vacantes
        </Boton>
        <h1>Vacante no encontrada</h1>
        <p className="introduccion">Esta vacante no existe o no pertenece a tu empresa.</p>
      </>
    )
  }

  return (
    <>
      <Boton variante="secundario" to="/empresa/vacantes">
        ← Volver a mis vacantes
      </Boton>
      <h1>Solicitudes recibidas</h1>
      <p className="introduccion introduccion--grande">Vacante: {vacante.titulo}</p>

      {aviso?.tipo === 'error' && (
        <p className="campo-formulario__error" role="alert">
          {aviso.texto}
        </p>
      )}
      {aviso?.tipo === 'exito' && <p role="status">{aviso.texto}</p>}

      {cargando && (
        <p className="introduccion" role="status">
          Cargando solicitudes…
        </p>
      )}
      {!cargando && error && (
        <p className="campo-formulario__error" role="alert">
          No se pudieron cargar las solicitudes. Intenta de nuevo más tarde.
        </p>
      )}
      {!cargando && !error && solicitudes.length === 0 && <p>Esta vacante aún no tiene solicitudes.</p>}

      {!cargando && !error && solicitudes.length > 0 && (
        <ul className="lista-solicitudes">
          {solicitudes.map((solicitud) => {
            const candidato = solicitud.candidato
            const nombre = candidato?.nombre ?? 'Sin nombre'
            return (
              <li key={solicitud.id}>
                <article className="tarjeta solicitud">
                  <div className="solicitud__datos">
                    <h2 className="solicitud__titulo">{nombre}</h2>
                    <p className="solicitud__detalle">Edad: {candidato?.edad ? `${candidato.edad} años` : 'Sin dato'}</p>
                    <p className="solicitud__detalle">Colonia: {candidato?.colonia ?? 'Sin dato'}</p>
                    <p className="solicitud__detalle">Experiencia: {candidato?.experiencia ?? 'Sin experiencia registrada'}</p>
                    <p className="solicitud__detalle">Enviada el {formatearFecha(solicitud.creada_en)}</p>
                  </div>
                  <div className="solicitud__acciones">
                    <EtiquetaEstatus valor={solicitud.estatus} />
                    <div className="solicitud__botones">
                      {RESPUESTAS.filter((respuesta) => respuesta.estatus !== solicitud.estatus).map((respuesta) => (
                        <Boton
                          key={respuesta.estatus}
                          variante={respuesta.estatus === 'Aceptada' ? 'primario' : 'secundario'}
                          onClick={() => responder(solicitud, respuesta.estatus)}
                          disabled={cambiando === solicitud.id}
                        >
                          {respuesta.texto}
                          <span className="visualmente-oculto"> la solicitud de {nombre}</span>
                        </Boton>
                      ))}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
