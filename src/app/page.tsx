// src/app/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  const session = await auth();

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agency: {
        select: { name: true, slug: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-ocean-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold hover:text-accent transition">
            EnmaLead
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="bg-accent hover:bg-accent-dim text-ocean-950 font-medium px-3 py-1.5 rounded-lg transition"
              >
                Ir al dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-accent transition">
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-accent hover:bg-accent-dim text-ocean-950 font-medium px-3 py-1.5 rounded-lg transition"
                >
                  Registra tu agencia
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header className="bg-ocean-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold">EnmaLead</h1>
          <p className="text-white/70 mt-2">
            Encuentra tu próxima propiedad y habla con el asistente de voz de la
            agencia
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-ocean-950">
            Propiedades disponibles
          </h2>
          <span className="text-sm text-gray-500">
            {properties.length} propiedad{properties.length !== 1 ? "es" : ""}
          </span>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            Todavía no hay propiedades publicadas en la plataforma.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/${property.agency.slug}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="h-40 bg-ocean-100 flex items-center justify-center text-ocean-400 text-sm">
                  {property.images[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      width={400}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "Sin imagen"
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-ocean-600 font-medium mb-1">
                    {property.agency.name}
                  </p>
                  <h3 className="font-semibold text-ocean-950">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-500">{property.location}</p>
                  <p className="text-lg font-bold text-ocean-800 mt-2">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
