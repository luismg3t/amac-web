import { useState } from 'react'

export function useFormulario(inicial) {
  const [valores, setValores] = useState(inicial)
  const [errores, setErrores] = useState({})

  function alCambiar(evento) {
    const { name, type, checked, value } = evento.target
    setValores((previos) => ({ ...previos, [name]: type === 'checkbox' ? checked : value }))
  }

  function validar(reglas) {
    const encontrados = reglas(valores)
    setErrores(encontrados)
    const primero = Object.keys(encontrados)[0]
    if (primero) document.getElementById(primero)?.focus()
    return !primero
  }

  function campo(id) {
    return { id, value: valores[id], onChange: alCambiar, error: errores[id] }
  }

  return { valores, errores, alCambiar, validar, campo }
}
