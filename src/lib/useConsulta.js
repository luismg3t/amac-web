import { useCallback, useEffect, useState } from 'react'

export function useConsulta(consultar, dependencias) {
  const [estado, setEstado] = useState({ cargando: true, datos: null, error: null })

  useEffect(() => {
    let vigente = true
    setEstado((previo) => ({ ...previo, cargando: true }))
    Promise.resolve(consultar()).then(({ data, error }) => {
      if (vigente) setEstado({ cargando: false, datos: data, error })
    })
    return () => {
      vigente = false
    }
  }, dependencias)

  const setDatos = useCallback((cambio) => {
    setEstado((previo) => ({
      ...previo,
      datos: typeof cambio === 'function' ? cambio(previo.datos) : cambio,
    }))
  }, [])

  return { ...estado, setDatos }
}
