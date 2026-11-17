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
  return sinVacios({
    nombre: datos.nombre.trim() ? null : 'Escribe el nombre de la empresa.',
    giro: datos.giro.trim() ? null : 'Escribe a qué se dedica la empresa.',
    telefono: validarTelefono(datos.telefono),
    correo: validarCorreo(datos.correo),
    contrasena: validarContrasena(datos.contrasena),
  })
}

export default function RegistroEmpresa() {
  useTitulo('Registrar empresa')

  const { perfil } = useAuth()
  const { valores, validar, campo } = useFormulario({
    nombre: '',
    giro: '',
    telefono: '',
    correo: '',
    contrasena: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [pendienteDeCorreo, setPendienteDeCorreo] = useState(false)

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
          rol: 'empresa',
          nombre: valores.nombre.trim(),
          giro: valores.giro.trim(),
          telefono: soloDigitos(valores.telefono),
        },
      },
    })
    setEnviando(false)

    if (error) {
      setMensaje(mensajeRegistro(error))
    } else if (data.user?.identities?.length === 0) {
      setMensaje('Ya existe una cuenta con ese correo. Inicia sesión.')
    } else if (!data.session) {
      setPendienteDeCorreo(true)
    }
  }

  if (pendienteDeCorreo) {
    return (
      <section className="tarjeta tarjeta--formulario tarjeta-centrada" aria-labelledby="titulo-registro">
        <h1 id="titulo-registro">Tu empresa fue registrada</h1>
        <p role="status">
          Te enviamos un correo. Ábrelo y toca el enlace para confirmar tu cuenta antes de iniciar sesión.
        </p>
        <Boton bloque to="/login">
          Iniciar sesión
        </Boton>
      </section>
    )
  }

  if (perfil && !enviando) {
    return <Navigate to={perfil.rol === 'empresa' ? '/empresa/vacantes' : '/'} replace />
  }

  return (
    <section
      className="tarjeta tarjeta--formulario tarjeta-centrada tarjeta-centrada--amplia"
      aria-labelledby="titulo-registro"
    >
      <h1 id="titulo-registro">Registra tu empresa</h1>
      <p className="introduccion">Con tu cuenta podrás publicar vacantes y recibir solicitudes.</p>

      <form className="formulario formulario--largo" onSubmit={registrar} noValidate>
        <fieldset className="grupo-campos">
          <legend>Datos de la empresa</legend>
          <div className="cuadricula-formulario">
            <CampoFormulario
              {...campo('nombre')}
              etiqueta="Nombre de la empresa"
              type="text"
              autoComplete="organization"
              ancho
              required
            />
            <CampoFormulario
              {...campo('giro')}
              etiqueta="Giro"
              type="text"
              autoComplete="off"
              ayuda="Ejemplo: comercio, restaurante, seguridad."
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
          <legend>Acceso a tu cuenta</legend>
          <div className="cuadricula-formulario">
            <CampoFormulario
              {...campo('correo')}
              etiqueta="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="nombre@empresa.com"
              required
            />
            <CampoFormulario
              {...campo('contrasena')}
              etiqueta="Contraseña"
              type="password"
              autoComplete="new-password"
              ayuda="Mínimo 8 caracteres."
              required
            />
          </div>
        </fieldset>

        {mensaje && (
          <p className="campo-formulario__error" role="alert">
            {mensaje}
          </p>
        )}
        <Boton variante="acento" bloque type="submit" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrar mi empresa'}
        </Boton>
      </form>

      <p className="tarjeta-centrada__pregunta">¿Ya tienes cuenta?</p>
      <Boton variante="secundario" bloque to="/login">
        Iniciar sesión
      </Boton>
      <p className="tarjeta-centrada__pregunta">¿Buscas trabajo?</p>
      <Boton variante="secundario" bloque to="/registro">
        Crear cuenta de candidato
      </Boton>
    </section>
  )
}
