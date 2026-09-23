// cat src/app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md w-full">
        <p className="text-sm font-medium text-ocean-600">Error 404</p>
        <h1 className="text-xl font-bold text-ocean-950 mt-1">
          Página no encontrada
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          La agencia o la propiedad que buscas no existe o fue retirada.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 bg-accent hover:bg-accent-dim text-ocean-950 font-medium px-4 py-2 rounded-lg transition"
        >
          Ver propiedades disponibles
        </Link>
      </div>
    </div>
  );
}