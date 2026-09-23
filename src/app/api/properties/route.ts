// src/app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

async function generateUniqueSlug(agencyId: string, title: string) {
  const base = slugify(title);
  let slug = base;
  let counter = 2;

  while (
    await prisma.property.findUnique({
      where: { agencyId_slug: { agencyId, slug } },
    })
  ) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const properties = await prisma.property.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ properties });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, price, location, amenities, images } = body;

    if (!title || !price || !location) {
      return NextResponse.json(
        { error: "Título, precio y ubicación son requeridos" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(session.user.agencyId, title);

    const property = await prisma.property.create({
      data: {
        agencyId: session.user.agencyId,
        slug,
        title,
        description: description ?? null,
        price: Number(price),
        location,
        amenities: Array.isArray(amenities) ? amenities : [],
        images: Array.isArray(images) ? images : [],
      },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (err) {
    console.error("Error creando propiedad:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}