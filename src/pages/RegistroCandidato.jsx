import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useFormulario } from '../lib/useFormulario'
import { useTitulo } from '../lib/useTitulo'
import {
  mensajeRegistro,
  sinVacios,
  soloDigitos,
  validarContrasena,
  validarCorreo,
  validarTelefono,
} from '../lib/validacion'
import Boton from '../components/Boton'
import CampoFormulario from '../components/CampoFormulario'

function reglas(datos) {
  const edad = Number(datos.edad)
  const edadValida = /^\d+$/.test(datos.edad.trim()) && edad >= 18 && edad <= 120

  return sinVacios({
    nombre: datos.nombre.trim() ? null : 'Escribe tu nombre completo.',
    edad: edadValida ? null : 'Escribe tu edad con números. Debes tener 18 años o más.',
    correo: validarCorreo(datos.correo),
    telefono: validarTelefono(datos.telefono),
    colonia: datos.colonia.trim() ? null : 'Escribe la colonia donde vives.',
    contrasena: validarContrasena(datos.contrasena),
    contrasena2: datos.contrasena2 === datos.contrasena ? null : 'Las contraseñas no son iguales.',
    terminos: datos.terminos ? null : 'Para crear tu cuenta debes aceptar el aviso de privacidad.',
  })
}

export default function RegistroCandidato() {
  useTitulo('Crear cuenta')

  const { perfil } = useAuth()
  const { valores, errores, alCambiar, validar, campo } = useFormulario({
    nombre: '',
    edad: '',
    correo: '',
    telefono: '',
    colonia: '',
    experiencia: '',
    contrasena: '',
    contrasena2: '',
    terminos: false,
  })
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [registro, setRegistro] = useState(null)

  async function registrar(evento) {
    evento.preventDefault()
    setMensaje('')
    if (!validar(reglas)) return

    setEnviando(true)
    const { data, error } = await supabase.auth.signUp({
      email: valores.correo.trim(),
      password: valores.contrasena,
      options: {
        data: {
          rol: 'candidato',
          nombre: valores.nombre.trim(),
          telefono: soloDigitos(valores.telefono),
          edad: Number(valores.edad),
          colonia: valores.colonia.trim(),
          experiencia: valores.experiencia.trim(),
        },
      },
    })
    setEnviando(false)

    if (error) {
      setMensaje(mensajeRegistro(error))
    } else if (data.user?.identities?.length === 0) {
      setMensaje('Ya existe una cuenta con ese correo. Inicia sesión.')
    } else {
      setRegistro({ conSesion: Boolean(data.session) })
    }
  }

  if (registro) {
    return (
      <section className="tarjeta tarjeta--formulario tarjeta-centrada" aria-labelledby="titulo-registro">
        <h1 id="titulo-registro">Tu cuenta fue creada</h1>
        <p role="status">
          AMAC revisará tu registro. Cuando lo apruebe podrás postularte a las vacantes.
        </p>
        {registro.conSesion ? (
          <Boton bloque to="/">
            Ver vacantes
          </Boton>
        ) : (
          <>
            <p>Te enviamos un correo. Ábrelo y toca el enlace para confirmar tu cuenta antes de iniciar sesión.</p>
            <Boton bloque to="/login">
              Iniciar sesión
            </Boton>
          </>
        )}
      </section>
    )
  }

  if (perfil && !enviando) {
    return <Navigate to="/" replace />
  }

  return (
    <section
      className="tarjeta tarjeta--formulario tarjeta-centrada tarjeta-centrada--amplia"
      aria-labelledby="titulo-registro"
    >
      <h1 id="titulo-registro">Crea tu cuenta</h1>
      <p className="introduccion">Llena tus datos. Solo toma unos minutos.</p>

      <form className="formulario formulario--largo" onSubmit={registrar} noValidate>
        <fieldset className="grupo-campos">
          <legend>Datos personales</legend>
          <div className="cuadricula-formulario">
            <CampoFormulario
              {...campo('nombre')}
              etiqueta="Nombre completo"
              type="text"
              autoComplete="name"
              ancho
              required
            />
            <CampoFormulario
              {...campo('edad')}
              etiqueta="Edad"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              ayuda="Escribe tu edad en años."
              required
            />
            <CampoFormulario
              {...campo('colonia')}
              etiqueta="Colonia"
              type="text"
              autoComplete="address-level3"
              required
            />
          </div>
        </fieldset>

        <fieldset className="grupo-campos">
          <legend>Contacto</legend>
          <div className="cuadricula-formulario">
            <CampoFormulario
              {...campo('correo')}
              etiqueta="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="nombre@correo.com"
              required
            />
            <CampoFormulario
              {...campo('telefono')}
              etiqueta="Teléfono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              ayuda="Escribe los 10 dígitos."
              required
            />
          </div>
        </fieldset>

        <fieldset className="grupo-campos">
          <legend>Experiencia</legend>
          <div className="cuadricula-formulario">
            <CampoFormulario
              {...campo('experiencia')}
              etiqueta="¿Qué trabajos has hecho?"
              como="textarea"
              rows="4"
              ayuda="Cuéntanos con tus palabras. Puedes dejarlo en blanco."
              ancho
            />
          </div>
        </fieldset>

        <fieldset className="grupo-campos">
          <legend>Acceso a tu cuenta</legend>
          <div className="cuadricula-formulario">
            <CampoFormulario
              {...campo('contrasena')}
              etiqueta="Contraseña"
              type="password"
              autoComplete="new-password"
              ayuda="Mínimo 8 caracteres."
              required
            />
            <CampoFormulario
              {...campo('contrasena2')}
              etiqueta="Repite tu contraseña"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
        </fieldset>

        <div>
          <div className="campo-casilla">
            <input
              type="checkbox"
              id="terminos"
              name="terminos"
              checked={valores.terminos}
              onChange={alCambiar}
              aria-describedby={errores.terminos ? 'terminos-error' : undefined}
              aria-invalid={errores.terminos ? 'true' : undefined}
              required
            />
            <label htmlFor="terminos">
              Acepto el <a href="#">aviso de privacidad</a> y los términos de uso.
            </label>
          </div>
          {errores.terminos && (
            <p className="campo-formulario__error" id="terminos-error">
              {errores.terminos}
            </p>
          )}
        </div>

        {mensaje && (
          <p className="campo-formulario__error" role="alert">
            {mensaje}
          </p>
        )}
        <Boton variante="acento" bloque type="submit" disabled={enviando}>
          {enviando ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
        </Boton>
      </form>

      <p className="tarjeta-centrada__pregunta">¿Ya tienes cuenta?</p>
      <Boton variante="secundario" bloque to="/login">
        Iniciar sesión
      </Boton>
      <p className="tarjeta-centrada__pregunta">¿Eres una empresa?</p>
      <Boton variante="secundario" bloque to="/registro-empresa">
        Registrar mi empresa
      </Boton>
    </section>
  )
}
