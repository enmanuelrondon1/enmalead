// cat src/app/error.tsx

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-md w-full">
        <h1 className="text-xl font-bold text-ocean-950">
          Algo salió mal
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          No pudimos cargar esta página. Puedes intentarlo de nuevo o volver al
          inicio.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-3 font-mono">
            Código: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => reset()}
            className="bg-accent hover:bg-accent-dim text-ocean-950 font-medium px-4 py-2 rounded-lg transition"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="text-sm text-ocean-800 hover:underline"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}