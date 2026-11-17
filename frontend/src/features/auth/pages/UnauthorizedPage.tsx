import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        🔒
      </span>
      <h1 className="text-2xl font-bold text-stone-900">Sin permiso</h1>
      <p className="text-stone-600">No tenés permisos para ver esta página.</p>
      <Link to="/" className="mt-2 font-medium text-orange-700 hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
