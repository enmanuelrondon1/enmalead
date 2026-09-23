// src/app/api/agency/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: session.user.agencyId },
    select: { id: true, name: true, slug: true, assistantPrompt: true },
  });

  return NextResponse.json({ agency });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Solo un administrador puede editar la configuración" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, assistantPrompt } = body;

    const updated = await prisma.agency.update({
      where: { id: session.user.agencyId },
      data: {
        ...(name !== undefined && { name }),
        ...(assistantPrompt !== undefined && { assistantPrompt }),
      },
    });

    return NextResponse.json({ agency: updated });
  } catch (err) {
    console.error("Error actualizando configuración:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}