// src/app/[slug]/propiedades/[propertySlug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { VoiceWidget } from "../../voice-widget";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; propertySlug: string }>;
}) {
  const { slug, propertySlug } = await params;

  const agency = await prisma.agency.findUnique({
    where: { slug },
    include: { properties: true },
  });

  if (!agency) {
    notFound();
  }

  const property = agency.properties.find((p) => p.slug === propertySlug);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-ocean-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href={`/${slug}`} className="text-white/70 hover:text-white text-sm">
            ← Volver a {agency.name}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {property.images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 rounded-xl overflow-hidden">
            <div className="sm:row-span-2 h-64 sm:h-full">
              <Image
                src={property.images[0]}
                alt={property.title}
                width={600}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
            {property.images.slice(1, 3).map((img, i) => (
              <div key={img} className="h-32 sm:h-full">
                <Image
                  src={img}
                  alt={`${property.title} ${i + 2}`}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 bg-ocean-100 flex items-center justify-center text-ocean-400 rounded-xl mb-6">
            Sin imágenes
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-ocean-600 font-medium mb-1">{agency.name}</p>
          <h1 className="text-2xl font-bold text-ocean-950">{property.title}</h1>
          <p className="text-gray-500 mt-1">{property.location}</p>
          <p className="text-2xl font-bold text-ocean-800 mt-3">
            ${property.price.toLocaleString()}
          </p>

          {property.description && (
            <p className="text-gray-700 mt-4 leading-relaxed">{property.description}</p>
          )}

          {property.amenities.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h2 className="text-sm font-semibold text-ocean-950 mb-2">Amenidades</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="bg-ocean-100 text-ocean-800 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
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