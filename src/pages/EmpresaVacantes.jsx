import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useConsulta } from '../lib/useConsulta'
import { useTitulo } from '../lib/useTitulo'
import { formatearSueldo } from '../lib/formato'
import Boton from '../components/Boton'
import EtiquetaEstatus from '../components/EtiquetaEstatus'

const AVISOS = {
  activa: 'se reactivó',
  pausada: 'se pausó',
  cerrada: 'se cerró',
}

export default function EmpresaVacantes() {
  useTitulo('Mis vacantes')

  const { sesion, perfil } = useAuth()
  const usuarioId = sesion.user.id
  const [aviso, setAviso] = useState(null)
  const [cambiando, setCambiando] = useState(null)

  const { cargando, datos, error, setDatos } = useConsulta(
    () =>
      supabase
        .from('vacantes')
        .select('id, titulo, sueldo, estado, solicitudes(estatus)')
        .eq('empresa_id', usuarioId)
        .order('creada_en', { ascending: false }),
    [usuarioId],
  )

  const vacantes = datos ?? []

  async function cambiarEstado(vacante, estado) {
    if (estado === 'cerrada') {
      const confirmado = window.confirm(`¿Seguro que quieres cerrar la vacante ${vacante.titulo}? Ya no podrás reactivarla.`)
      if (!confirmado) return
    }

    setAviso(null)
    setCambiando(vacante.id)
    const { data, error: fallo } = await supabase
      .from('vacantes')
      .update({ estado })
      .eq('id', vacante.id)
      .select('id')
    setCambiando(null)

    if (fallo || data.length === 0) {
      setAviso({ tipo: 'error', texto: 'No se pudo actualizar la vacante. Intenta de nuevo.' })
      return
    }

    setDatos((previas) => previas.map((previa) => (previa.id === vacante.id ? { ...previa, estado } : previa)))
    setAviso({ tipo: 'exito', texto: `La vacante ${vacante.titulo} ${AVISOS[estado]}.` })
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div className="encabezado-pagina__titulos">
          <h1>Mis vacantes</h1>
          <p className="introduccion introduccion--grande">Empresa: {perfil.nombre}</p>
        </div>
        <Boton variante="acento" to="/empresa/publicar">
          Publicar nueva vacante
        </Boton>
      </div>

      {aviso?.tipo === 'error' && (
        <p className="campo-formulario__error" role="alert">
          {aviso.texto}
        </p>
      )}
      {aviso?.tipo === 'exito' && <p role="status">{aviso.texto}</p>}

      {cargando && (
        <p className="introduccion" role="status">
          Cargando tus vacantes…
        </p>
      )}
      {!cargando && error && (
        <p className="campo-formulario__error" role="alert">
          No se pudieron cargar tus vacantes. Intenta de nuevo más tarde.
        </p>
      )}
      {!cargando && !error && vacantes.length === 0 && (
        <p>Aún no has publicado vacantes. Toca “Publicar nueva vacante” para crear la primera.</p>
      )}

      {!cargando && !error && vacantes.length > 0 && (
        <ul className="lista-vacantes-empresa">
          {vacantes.map((vacante) => {
            const recibidas = vacante.solicitudes.filter((solicitud) => solicitud.estatus !== 'Cancelada').length
            const ocupada = cambiando === vacante.id
            return (
              <li key={vacante.id}>
                <article className="tarjeta vacante-empresa">
                  <div className="vacante-empresa__datos">
                    <h2 className="vacante-empresa__titulo">{vacante.titulo}</h2>
                    <p className="vacante-empresa__detalle">Sueldo: {formatearSueldo(vacante.sueldo)}</p>
                    <p>
                      <strong>
                        {recibidas} {recibidas === 1 ? 'solicitud recibida' : 'solicitudes recibidas'}
                      </strong>
                    </p>
                  </div>
                  <div className="vacante-empresa__acciones">
                    <EtiquetaEstatus valor={vacante.estado} prefijo="Estado" prefijoVisible />
                    <div className="vacante-empresa__botones">
                      <Boton to={`/empresa/vacantes/${vacante.id}/solicitudes`}>
                        Ver solicitudes<span className="visualmente-oculto"> de {vacante.titulo}</span>
                      </Boton>
                      {vacante.estado === 'activa' && (
                        <Boton variante="secundario" onClick={() => cambiarEstado(vacante, 'pausada')} disabled={ocupada}>
                          Pausar<span className="visualmente-oculto"> {vacante.titulo}</span>
                        </Boton>
                      )}
                      {vacante.estado === 'pausada' && (
                        <Boton variante="secundario" onClick={() => cambiarEstado(vacante, 'activa')} disabled={ocupada}>
                          Reactivar<span className="visualmente-oculto"> {vacante.titulo}</span>
                        </Boton>
                      )}
                      {vacante.estado !== 'cerrada' && (
                        <Boton variante="secundario" onClick={() => cambiarEstado(vacante, 'cerrada')} disabled={ocupada}>
                          Cerrar<span className="visualmente-oculto"> {vacante.titulo}</span>
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
    </>
  )
}
