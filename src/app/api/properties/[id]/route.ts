// cat src/app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

async function getOwnedProperty(propertyId: string, agencyId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property || property.agencyId !== agencyId) {
    return null;
  }

  return property;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getOwnedProperty(id, session.user.agencyId);

  if (!property) {
    return NextResponse.json(
      { error: "Propiedad no encontrada" },
      { status: 404 },
    );
  }

  return NextResponse.json({ property });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedProperty(id, session.user.agencyId);

  if (!existing) {
    return NextResponse.json(
      { error: "Propiedad no encontrada" },
      { status: 404 },
    );
  }

  try {
    const body = await req.json();
    const { title, description, price, location, amenities, images } = body;

    let slug = existing.slug;
    if (title !== undefined && title !== existing.title) {
      const base = slugify(title) || "propiedad";
      let candidate = base;
      let counter = 2;

      while (
        candidate !== existing.slug &&
        (await prisma.property.findUnique({
          where: {
            agencyId_slug: { agencyId: session.user.agencyId, slug: candidate },
          },
        }))
      ) {
        candidate = `${base}-${counter}`;
        counter++;
      }

      slug = candidate;
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        slug,
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(location !== undefined && { location }),
        ...(amenities !== undefined && { amenities }),
        ...(images !== undefined && { images }),
      },
    });

    return NextResponse.json({ property });
  } catch (err) {
    console.error("Error actualizando propiedad:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedProperty(id, session.user.agencyId);

  if (!existing) {
    return NextResponse.json(
      { error: "Propiedad no encontrada" },
      { status: 404 },
    );
  }

  await prisma.property.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
