// src/app/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { SearchInput } from "@/components/search-input";

const PAGE_SIZE = 12;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  const { q, page } = await searchParams;

  const query = (q ?? "").trim().slice(0, 100);

  const where = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { location: { contains: query, mode: "insensitive" as const } },
          { agency: { name: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const total = await prisma.property.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(1, parseInt(page ?? "1", 10) || 1),
    totalPages
  );

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      agency: {
        select: { name: true, slug: true },
      },
    },
  });

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/?${s}` : "/";
  }

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
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-10">
          <h1 className="text-3xl font-bold">Encuentra tu próxima propiedad</h1>
          <p className="text-white/70 mt-2">
            Explora las propiedades y habla con el asistente de voz de la
            agencia para resolver tus dudas
          </p>

          <SearchInput initialQuery={query} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-ocean-950">
            {query ? `Resultados para "${query}"` : "Propiedades disponibles"}
          </h2>
          <span className="text-sm text-gray-500">
            {total} propiedad{total !== 1 ? "es" : ""}
          </span>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            {query ? (
              <>
                No encontramos propiedades para esa búsqueda.{" "}
                <Link href="/" className="text-ocean-800 underline">
                  Ver todas
                </Link>
              </>
            ) : (
              "Todavía no hay propiedades publicadas en la plataforma."
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/${property.agency.slug}/propiedades/${property.slug}`}
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
                  <h3 className="font-semibold text-ocean-950 line-clamp-2">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {property.location}
                  </p>
                  <p className="text-lg font-bold text-ocean-800 mt-2">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-4 mt-8 text-sm">
            {currentPage > 1 ? (
              <Link
                href={pageHref(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-ocean-800 hover:bg-gray-50 transition"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-lg border border-gray-100 text-gray-300">
                ← Anterior
              </span>
            )}

            <span className="text-gray-500">
              Página {currentPage} de {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={pageHref(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-ocean-800 hover:bg-gray-50 transition"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-lg border border-gray-100 text-gray-300">
                Siguiente →
              </span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}