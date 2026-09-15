// src/app/dashboard/properties/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeletePropertyButton } from "./delete-button";

export default async function PropertiesPage() {
  const session = await auth();

  const properties = await prisma.property.findMany({
    where: { agencyId: session!.user.agencyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ocean-950">Propiedades</h1>
          <p className="text-sm text-gray-500">
            {properties.length} propiedad{properties.length !== 1 ? "es" : ""}{" "}
            activa
            {properties.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="bg-ocean-800 hover:bg-ocean-950 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
        >
          + Nueva propiedad
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            Todavía no tienes propiedades cargadas.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="text-ocean-800 font-medium hover:underline text-sm mt-2 inline-block"
          >
            Crea la primera
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <h3 className="font-semibold text-ocean-950">{property.title}</h3>
              <p className="text-sm text-gray-500">{property.location}</p>
              <p className="text-lg font-bold text-ocean-800 mt-2">
                ${property.price.toLocaleString()}
              </p>

              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/dashboard/properties/${property.id}/edit`}
                  className="text-sm text-ocean-800 hover:underline"
                >
                  Editar
                </Link>
                <DeletePropertyButton propertyId={property.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
