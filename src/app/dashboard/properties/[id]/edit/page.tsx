// src/app/dashboard/properties/[id]/edit/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditPropertyForm } from "./edit-form";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const property = await prisma.property.findUnique({ where: { id } });

  if (!property || property.agencyId !== session!.user.agencyId) {
    notFound();
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-ocean-950 mb-6">Editar propiedad</h1>
      <EditPropertyForm property={property} />
    </div>
  );
}