export default function CampoFormulario({ id, etiqueta, ayuda, error, ancho = false, como = 'input', children, ...resto }) {
  const Control = como
  const clases = ['campo-formulario', ancho && 'campo-formulario--ancho', error && 'campo-formulario--error']
    .filter(Boolean)
    .join(' ')
  const descripciones = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ')

  return (
    <div className={clases}>
      <label htmlFor={id}>{etiqueta}</label>
      <Control
        id={id}
        name={id}
        aria-describedby={descripciones || undefined}
        aria-invalid={error ? 'true' : undefined}
        {...resto}
      >
        {children}
      </Control>
      {ayuda && (
        <p className="campo-formulario__ayuda" id={`${id}-ayuda`}>
          {ayuda}
        </p>
      )}
      {error && (
        <p className="campo-formulario__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
