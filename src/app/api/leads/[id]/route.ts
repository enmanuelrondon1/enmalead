// src/app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const lead = await prisma.voiceLead.findUnique({ where: { id } });

  if (!lead || lead.agencyId !== session.user.agencyId) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    if (!["NEW", "CONTACTED", "CLOSED"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const updated = await prisma.voiceLead.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ lead: updated });
  } catch (err) {
    console.error("Error actualizando lead:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}