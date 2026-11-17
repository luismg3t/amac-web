import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useConsulta } from '../lib/useConsulta'
import { useTitulo } from '../lib/useTitulo'
import { formatearFecha } from '../lib/formato'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import Icono from '../components/Icono'

const CANCELABLES = ['Enviada', 'En revisión']

export default function MisSolicitudes() {
  useTitulo('Mis solicitudes')

  const { sesion } = useAuth()
  const usuarioId = sesion.user.id
  const [aviso, setAviso] = useState(null)
  const [cancelando, setCancelando] = useState(null)

  const { cargando, datos, error, setDatos } = useConsulta(
    () =>
      supabase
        .from('solicitudes')
        .select('id, estatus, creada_en, vacante:vacantes(id, titulo, empresa:perfiles!vacantes_empresa_id_fkey(nombre))')
        .eq('candidato_id', usuarioId)
        .order('creada_en', { ascending: false }),
    [usuarioId],
  )

  const solicitudes = datos ?? []

  async function cancelar(solicitud) {
    if (!CANCELABLES.includes(solicitud.estatus)) return
    const titulo = solicitud.vacante?.titulo ?? 'esta vacante'
    if (!window.confirm(`¿Seguro que quieres cancelar tu solicitud para ${titulo}?`)) return

    setAviso(null)
    setCancelando(solicitud.id)
    const { data, error: fallo } = await supabase
      .from('solicitudes')
      .update({ estatus: 'Cancelada' })
      .eq('id', solicitud.id)
      .select('id, estatus')
    setCancelando(null)

    if (fallo || data.length === 0) {
      setAviso({ tipo: 'error', texto: 'No se pudo cancelar la solicitud. Es posible que la empresa ya la haya respondido.' })
      return
    }

    setDatos((previas) =>
      previas.map((previa) => (previa.id === solicitud.id ? { ...previa, estatus: 'Cancelada' } : previa)),
    )
    setAviso({ tipo: 'exito', texto: `Cancelaste tu solicitud para ${titulo}.` })
  }

  return (
    <>
      <h1>Mis solicitudes</h1>
      <p className="introduccion">Aquí ves las vacantes a las que te postulaste y cómo va cada una.</p>

      {aviso?.tipo === 'error' && (
        <p className="campo-formulario__error" role="alert">
          {aviso.texto}
        </p>
      )}
      {aviso?.tipo === 'exito' && <p role="status">{aviso.texto}</p>}

      {cargando && (
        <p className="introduccion" role="status">
          Cargando tus solicitudes…
        </p>
      )}
      {!cargando && error && (
        <p className="campo-formulario__error" role="alert">
          No se pudieron cargar tus solicitudes. Intenta de nuevo más tarde.
        </p>
      )}
      {!cargando && !error && solicitudes.length === 0 && <p>Aún no te has postulado a ninguna vacante.</p>}

      {!cargando && !error && solicitudes.length > 0 && (
        <ul className="lista-solicitudes">
          {solicitudes.map((solicitud) => {
            const titulo = solicitud.vacante?.titulo ?? 'Vacante no disponible'
            return (
              <li key={solicitud.id}>
                <article className="tarjeta solicitud">
                  <div className="solicitud__datos">
                    <h2 className="solicitud__titulo">{titulo}</h2>
                    <p className="solicitud__detalle">Empresa: {solicitud.vacante?.empresa?.nombre ?? 'Sin nombre'}</p>
                    <p className="solicitud__detalle">Enviada el {formatearFecha(solicitud.creada_en)}</p>
                  </div>
                  <div className="solicitud__acciones">
                    <EtiquetaEstatus valor={solicitud.estatus} />
                    <div className="solicitud__botones">
                      {solicitud.vacante && (
                        <Boton variante="secundario" to={`/vacantes/${solicitud.vacante.id}`}>
                          Ver vacante<span className="visualmente-oculto"> de {titulo}</span>
                        </Boton>
                      )}
                      {CANCELABLES.includes(solicitud.estatus) && (
                        <Boton
                          variante="secundario"
                          onClick={() => cancelar(solicitud)}
                          disabled={cancelando === solicitud.id}
                        >
                          <Icono nombre="cerrar" />
                          <span>
                            Cancelar solicitud<span className="visualmente-oculto"> de {titulo}</span>
                          </span>
                        </Boton>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      <Boton to="/">Buscar más vacantes</Boton>
    </>
  )
}
