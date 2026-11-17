import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useFormulario } from '../lib/useFormulario'
import { useTitulo } from '../lib/useTitulo'
import { sinVacios, soloDigitos, validarTelefono } from '../lib/validacion'
import { CATEGORIAS, HORARIOS } from '../lib/catalogos'
import Boton from '../components/Boton'
import CampoFormulario from '../components/CampoFormulario'

function reglas(datos) {
  const sueldo = Number(datos.sueldo)
  const sueldoValido = /^\d+(\.\d{1,2})?$/.test(datos.sueldo.trim()) && sueldo > 0

  return sinVacios({
    titulo: datos.titulo.trim() ? null : 'Escribe el nombre del puesto.',
    sueldo: sueldoValido ? null : 'Escribe el sueldo mensual con números, sin comas ni signos.',
    ubicacion: datos.ubicacion.trim() ? null : 'Escribe la ciudad o colonia del trabajo.',
    horario: HORARIOS.includes(datos.horario) ? null : 'Elige un horario.',
    categoria: datos.categoria ? null : 'Elige una categoría.',
    descripcion: datos.descripcion.trim() ? null : 'Describe qué hará la persona.',
    requisitos: datos.requisitos.trim() ? null : 'Escribe los requisitos del puesto.',
    prestaciones: datos.prestaciones.trim() ? null : 'Escribe las prestaciones que ofreces.',
    telefono_contacto: datos.medio === 'telefono' ? validarTelefono(datos.telefono_contacto) : null,
  })
}

export default function PublicarVacante() {
  useTitulo('Publicar vacante')

  const { sesion } = useAuth()
  const navegar = useNavigate()
  const { valores, alCambiar, validar, campo } = useFormulario({
    titulo: '',
    sueldo: '',
    ubicacion: '',
    horario: '',
    categoria: '',
    descripcion: '',
    requisitos: '',
    prestaciones: '',
    medio: 'plataforma',
    telefono_contacto: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const porTelefono = valores.medio === 'telefono'

  async function publicar(evento) {
    evento.preventDefault()
    setMensaje('')
    if (!validar(reglas)) return

    setEnviando(true)
    const { error } = await supabase.from('vacantes').insert({
      empresa_id: sesion.user.id,
      titulo: valores.titulo.trim(),
      sueldo: Number(valores.sueldo),
      ubicacion: valores.ubicacion.trim(),
      horario: valores.horario,
      categoria: valores.categoria,
      descripcion: valores.descripcion.trim(),
      requisitos: valores.requisitos.trim(),
      prestaciones: valores.prestaciones.trim(),
      telefono_contacto: porTelefono ? soloDigitos(valores.telefono_contacto) : null,
    })
    setEnviando(false)

    if (error) {
      setMensaje('No se pudo publicar la vacante. Revisa los datos e intenta de nuevo.')
      return
    }

    navegar('/empresa/vacantes')
  }

  return (
    <section
      className="tarjeta tarjeta--formulario tarjeta-centrada tarjeta-centrada--amplia"
      aria-labelledby="titulo-publicar"
    >
      <h1 id="titulo-publicar">Publicar nueva vacante</h1>
      <p className="introduccion">Llena todos los datos. La vacante se publica en cuanto la guardes.</p>

      <form className="formulario formulario--largo" onSubmit={publicar} noValidate>
        <fieldset className="grupo-campos">
          <legend>Datos del puesto</legend>
          <div className="cuadricula-formulario">
            <CampoFormulario
              {...campo('titulo')}
              etiqueta="Nombre del puesto"
              type="text"
              placeholder="Ejemplo: Auxiliar de almacén"
              ancho
              required
            />
            <CampoFormulario
              {...campo('sueldo')}
              etiqueta="Sueldo mensual en pesos"
              type="text"
              inputMode="decimal"
              placeholder="Ejemplo: 9500"
              required
            />
            <CampoFormulario
              {...campo('ubicacion')}
              etiqueta="Ubicación"
              type="text"
              placeholder="Ejemplo: Monterrey, N.L."
              required
            />
            <CampoFormulario {...campo('horario')} etiqueta="Horario" como="select" required>
              <option value="">Elige un horario</option>
              {HORARIOS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </CampoFormulario>
            <CampoFormulario {...campo('categoria')} etiqueta="Categoría" como="select" required>
              <option value="">Elige una categoría</option>
              {CATEGORIAS.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </CampoFormulario>
          </div>
        </fieldset>

        <fieldset className="grupo-campos">
          <legend>Descripción</legend>
          <div className="cuadricula-formulario">
            <CampoFormulario
              {...campo('descripcion')}
              etiqueta="Qué hará la persona"
              como="textarea"
              rows="4"
              ayuda="Escribe una actividad por renglón."
              ancho
              required
            />
            <CampoFormulario
              {...campo('requisitos')}
              etiqueta="Requisitos"
              como="textarea"
              rows="4"
              ayuda="Escribe un requisito por renglón."
              ancho
              required
            />
            <CampoFormulario
              {...campo('prestaciones')}
              etiqueta="Prestaciones"
              como="textarea"
              rows="4"
              ayuda="Escribe una prestación por renglón."
              ancho
              required
            />
          </div>
        </fieldset>

        <fieldset className="grupo-campos">
          <legend>¿Cómo quieres recibir las postulaciones?</legend>
          <div className="opciones">
            <div className="campo-casilla">
              <input
                type="radio"
                id="medio-plataforma"
                name="medio"
                value="plataforma"
                checked={!porTelefono}
                onChange={alCambiar}
              />
              <label htmlFor="medio-plataforma">Solo por esta plataforma</label>
            </div>
            <div className="campo-casilla">
              <input
                type="radio"
                id="medio-telefono"
                name="medio"
                value="telefono"
                checked={porTelefono}
                onChange={alCambiar}
              />
              <label htmlFor="medio-telefono">Por esta plataforma y también por teléfono</label>
            </div>
          </div>
          <CampoFormulario
            {...campo('telefono_contacto')}
            etiqueta="Teléfono de contacto"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            ayuda="Solo se muestra si eliges recibir llamadas. Escribe los 10 dígitos."
            disabled={!porTelefono}
            required={porTelefono}
          />
        </fieldset>

        {mensaje && (
          <p className="campo-formulario__error" role="alert">
            {mensaje}
          </p>
        )}
        <Boton variante="acento" bloque type="submit" disabled={enviando}>
          {enviando ? 'Publicando…' : 'Publicar vacante'}
        </Boton>
      </form>

      <Boton variante="secundario" bloque to="/empresa/vacantes">
        Cancelar y volver a mis vacantes
      </Boton>
    </section>
  )
}
