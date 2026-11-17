import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useFormulario } from '../lib/useFormulario'
import { useTitulo } from '../lib/useTitulo'
import { sinVacios } from '../lib/validacion'
import Boton from '../components/Boton'
import CampoFormulario from '../components/CampoFormulario'

export default function Login() {
  useTitulo('Iniciar sesión')

  const { perfil, cargando } = useAuth()
  const ubicacion = useLocation()
  const { valores, validar, campo } = useFormulario({ correo: '', contrasena: '' })
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  if (!cargando && perfil) {
    const destino = perfil.rol === 'empresa' ? '/empresa/vacantes' : (ubicacion.state?.desde ?? '/')
    return <Navigate to={destino} replace />
  }

  async function entrar(evento) {
    evento.preventDefault()
    setMensaje('')

    const completo = validar((datos) =>
      sinVacios({
        correo: datos.correo.trim() ? null : 'Escribe tu correo electrónico.',
        contrasena: datos.contrasena ? null : 'Escribe tu contraseña.',
      }),
    )
    if (!completo) return

    setEnviando(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: valores.correo.trim(),
      password: valores.contrasena,
    })
    setEnviando(false)

    if (error?.code === 'email_not_confirmed') {
      setMensaje('Antes de entrar, abre el correo que te enviamos y confirma tu cuenta.')
    } else if (error) {
      setMensaje('Correo o contraseña incorrectos.')
    }
  }

  return (
    <section className="tarjeta tarjeta--formulario tarjeta-centrada" aria-labelledby="titulo-login">
      <h1 id="titulo-login">Iniciar sesión</h1>
      <p className="introduccion">Escribe tu correo y tu contraseña.</p>

      <form className="formulario" onSubmit={entrar} noValidate>
        <CampoFormulario
          {...campo('correo')}
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          required
        />
        <CampoFormulario
          {...campo('contrasena')}
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          ayuda="Escribe la contraseña que elegiste al crear tu cuenta."
          required
        />
        {mensaje && (
          <p className="campo-formulario__error" role="alert">
            {mensaje}
          </p>
        )}
        <Boton bloque type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </Boton>
      </form>

      <p className="tarjeta-centrada__pregunta">¿Aún no tienes cuenta?</p>
      <Boton variante="secundario" bloque to="/registro">
        Crear cuenta de candidato
      </Boton>
      <p className="tarjeta-centrada__pregunta">¿Eres una empresa?</p>
      <Boton variante="secundario" bloque to="/registro-empresa">
        Registrar mi empresa
      </Boton>
    </section>
  )
}
