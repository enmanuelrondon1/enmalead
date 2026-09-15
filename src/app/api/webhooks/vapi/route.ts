// src/app/api/webhooks/vapi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (message?.type !== "end-of-call-report") {
      return NextResponse.json({ received: true });
    }

    const structuredData = message.artifact?.structuredOutputs;
    const agencyId = message.call?.metadata?.agencyId;

    if (!structuredData || !agencyId) {
      console.warn("Webhook Vapi: faltan structuredOutputs o agencyId", { agencyId });
      return NextResponse.json({ received: true });
    }

    const firstProperty = await prisma.property.findFirst({
      where: { agencyId },
      orderBy: { createdAt: "asc" },
    });

    if (!firstProperty) {
      console.warn("Webhook Vapi: agencia sin propiedades, no se puede asociar el lead");
      return NextResponse.json({ received: true });
    }

    await prisma.voiceLead.create({
      data: {
        propertyId: firstProperty.id,
        name: structuredData.name ?? null,
        contact: structuredData.contact ?? null,
        preferredVisitTime: structuredData.preferredVisitTime ?? null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error en webhook de Vapi:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}