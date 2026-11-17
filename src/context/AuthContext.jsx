import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

async function consultarPerfil(id) {
  const { data, error } = await supabase.from('perfiles').select('*').eq('id', id).maybeSingle()
  return error ? null : data
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [sesionLista, setSesionLista] = useState(false)
  const [perfilCargado, setPerfilCargado] = useState(null)

  const usuarioId = sesion?.user?.id ?? null

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion)
      setSesionLista(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!usuarioId) return undefined
    let vigente = true
    consultarPerfil(usuarioId).then((datos) => {
      if (vigente) setPerfilCargado({ id: usuarioId, datos })
    })
    return () => {
      vigente = false
    }
  }, [usuarioId])

  const recargarPerfil = useCallback(async () => {
    if (!usuarioId) return
    const datos = await consultarPerfil(usuarioId)
    setPerfilCargado({ id: usuarioId, datos })
  }, [usuarioId])

  const cerrarSesion = useCallback(() => supabase.auth.signOut(), [])

  const perfilVigente = usuarioId !== null && perfilCargado?.id === usuarioId
  const perfil = perfilVigente ? perfilCargado.datos : null
  const cargando = !sesionLista || (usuarioId !== null && !perfilVigente)

  const valor = useMemo(
    () => ({ sesion, perfil, cargando, recargarPerfil, cerrarSesion }),
    [sesion, perfil, cargando, recargarPerfil, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return contexto
}
