// src/app/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { VoiceWidget } from "./voice-widget";

export default async function AgencyPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const agency = await prisma.agency.findUnique({
    where: { slug },
    include: {
      properties: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agency) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-ocean-950 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">{agency.name}</h1>
          <p className="text-white/70 text-sm mt-1">
            {agency.properties.length} propiedad
            {agency.properties.length !== 1 ? "es" : ""} disponible
            {agency.properties.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {agency.properties.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            Esta agencia todavía no tiene propiedades publicadas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agency.properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
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
                  <h3 className="font-semibold text-ocean-950">
                    {property.title}
                  </h3>
                  <p className="text-sm text-gray-500">{property.location}</p>
                  <p className="text-lg font-bold text-ocean-800 mt-2">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <VoiceWidget
        agencyId={agency.id}
        agencyName={agency.name}
        assistantTone={agency.assistantPrompt}
        properties={agency.properties.map((p) => ({
          title: p.title,
          price: p.price,
          location: p.location,
        }))}
      />
    </div>
  );
}
