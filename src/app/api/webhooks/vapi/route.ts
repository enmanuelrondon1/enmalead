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

    if (!structuredData) {
      console.warn("Webhook Vapi: no hay structuredOutputs");
      return NextResponse.json({ received: true });
    }

    const entry = Object.values(structuredData).find(
      (item: any) => item?.name === "interes_visitante_enmalead"
    ) as { result?: Record<string, string> } | undefined;

    const leadData = entry?.result;

    if (!leadData?.agencyId) {
      console.warn("Webhook Vapi: falta agencyId en leadData", leadData);
      return NextResponse.json({ received: true });
    }

    const firstProperty = await prisma.property.findFirst({
      where: { agencyId: leadData.agencyId },
      orderBy: { createdAt: "asc" },
    });

    if (!firstProperty) {
      console.warn("Webhook Vapi: agencia sin propiedades, no se puede asociar el lead");
      return NextResponse.json({ received: true });
    }

    await prisma.voiceLead.create({
      data: {
        propertyId: firstProperty.id,
        name: leadData.name ?? null,
        contact: leadData.contact ?? null,
        preferredVisitTime: leadData.preferredVisitTime ?? null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error en webhook de Vapi:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}