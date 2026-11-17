import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useConsulta } from '../lib/useConsulta'
import { useTitulo } from '../lib/useTitulo'
import { limpiarBusqueda } from '../lib/formato'
import { CATEGORIAS, HORARIOS } from '../lib/catalogos'
import Boton from '../components/Boton'
import CampoFormulario from '../components/CampoFormulario'
import Icono from '../components/Icono'
import TarjetaVacante from '../components/TarjetaVacante'

export default function ListadoVacantes() {
  useTitulo('Vacantes disponibles')

  const [parametros, setParametros] = useSearchParams()
  const busqueda = parametros.get('busqueda') ?? ''
  const horario = parametros.get('horario') ?? ''
  const categoria = parametros.get('categoria') ?? ''

  const [filtros, setFiltros] = useState({ busqueda, horario, categoria })

  useEffect(() => {
    setFiltros({ busqueda, horario, categoria })
  }, [busqueda, horario, categoria])

  const { cargando, datos, error } = useConsulta(() => {
    let consulta = supabase
      .from('vacantes')
      .select('id, titulo, sueldo, ubicacion, horario, categoria, empresa:perfiles!vacantes_empresa_id_fkey(nombre)')
      .eq('estado', 'activa')
      .order('creada_en', { ascending: false })

    const texto = limpiarBusqueda(busqueda)
    if (texto) consulta = consulta.or(`titulo.ilike.%${texto}%,ubicacion.ilike.%${texto}%`)
    if (horario) consulta = consulta.eq('horario', horario)
    if (categoria) consulta = consulta.eq('categoria', categoria)

    return consulta
  }, [busqueda, horario, categoria])

  const vacantes = datos ?? []

  function alCambiar(evento) {
    const { name, value } = evento.target
    setFiltros((previos) => ({ ...previos, [name]: value }))
  }

  function buscar(evento) {
    evento.preventDefault()
    const nuevos = {}
    if (filtros.busqueda.trim()) nuevos.busqueda = filtros.busqueda.trim()
    if (filtros.horario) nuevos.horario = filtros.horario
    if (filtros.categoria) nuevos.categoria = filtros.categoria
    setParametros(nuevos)
  }

  let resumen = `Mostrando ${vacantes.length} ${vacantes.length === 1 ? 'vacante' : 'vacantes'}`
  if (cargando) resumen = 'Cargando vacantes…'
  else if (error) resumen = 'No se pudieron cargar las vacantes. Intenta de nuevo más tarde.'
  else if (vacantes.length === 0) resumen = 'No hay vacantes para mostrar.'

  return (
    <>
      <h1>Encuentra tu próximo empleo</h1>
      <p className="introduccion">Escribe el puesto que buscas y toca el botón “Buscar vacantes”.</p>

      <form className="buscador tarjeta tarjeta--compacta" role="search" aria-label="Buscar vacantes" onSubmit={buscar}>
        <div className="buscador__campos">
          <CampoFormulario
            id="busqueda"
            etiqueta="¿Qué trabajo buscas?"
            type="search"
            placeholder="Ejemplo: cajero, Monterrey"
            autoComplete="off"
            ancho
            value={filtros.busqueda}
            onChange={alCambiar}
          />
          <CampoFormulario id="horario" etiqueta="Horario" como="select" value={filtros.horario} onChange={alCambiar}>
            <option value="">Todos los horarios</option>
            {HORARIOS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </CampoFormulario>
          <CampoFormulario id="categoria" etiqueta="Categoría" como="select" value={filtros.categoria} onChange={alCambiar}>
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </CampoFormulario>
          <Boton type="submit">
            <Icono nombre="buscar" />
            <span>Buscar vacantes</span>
          </Boton>
        </div>
      </form>

      <section className="resultados" aria-label="Resultados de la búsqueda">
        <p className="resultados__cantidad" role="status">
          {resumen}
        </p>
        {!cargando && !error && vacantes.length > 0 && (
          <ul className="lista-vacantes">
            {vacantes.map((vacante) => (
              <li key={vacante.id}>
                <TarjetaVacante vacante={vacante} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
