import { Link } from 'react-router-dom'

export default function Boton({ variante = 'primario', bloque = false, to, href, className, children, ...resto }) {
  const clases = ['boton', `boton--${variante}`, bloque && 'boton--bloque', className]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link className={clases} to={to} {...resto}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={clases} href={href} {...resto}>
        {children}
      </a>
    )
  }

  return (
    <button className={clases} type="button" {...resto}>
      {children}
    </button>
  )
}
