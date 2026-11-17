const MODIFICADORES = {
  'En revisión': 'revision',
  Aceptada: 'aceptada',
  Rechazada: 'no-seleccionada',
  Cancelada: 'no-seleccionada',
  activa: 'activa',
  pausada: 'pausada',
  cerrada: 'pausada',
}

const TEXTOS = {
  activa: 'Activa',
  pausada: 'Pausada',
  cerrada: 'Cerrada',
}

export default function EtiquetaEstatus({ valor, prefijo = 'Estatus', prefijoVisible = false }) {
  const modificador = MODIFICADORES[valor]
  const clases = modificador ? `etiqueta-estatus etiqueta-estatus--${modificador}` : 'etiqueta-estatus'

  return (
    <p className={clases}>
      {prefijoVisible ? `${prefijo}: ` : <span className="visualmente-oculto">{prefijo}: </span>}
      {TEXTOS[valor] ?? valor}
    </p>
  )
}
