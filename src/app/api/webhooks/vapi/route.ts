// src/app/api/webhooks/vapi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    console.log("[VAPI WEBHOOK] Tipo de evento:", message?.type);

    if (message?.type !== "end-of-call-report") {
      return NextResponse.json({ received: true });
    }

    const structuredData = message.artifact?.structuredOutputs;

    console.log("[VAPI WEBHOOK] structuredData:", JSON.stringify(structuredData));

    if (!structuredData) {
      return NextResponse.json({ received: true, debug: "no structuredOutputs" });
    }

    const entry = Object.values(structuredData).find(
      (item: any) => item?.name === "interes_visitante_enmalead"
    ) as { result?: Record<string, string> } | undefined;

    const leadData = entry?.result;

    console.log("[VAPI WEBHOOK] leadData:", JSON.stringify(leadData));

    if (!leadData?.agencyId) {
      return NextResponse.json({
        received: true,
        debug: "falta agencyId",
        structuredDataKeys: Object.keys(structuredData),
        leadData,
      });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: leadData.agencyId },
    });

    if (!agency) {
      return NextResponse.json({
        received: true,
        debug: "agencyId no coincide",
        agencyIdRecibido: leadData.agencyId,
      });
    }

    const created = await prisma.voiceLead.create({
      data: {
        agencyId: leadData.agencyId,
        name: leadData.name ?? null,
        contact: leadData.contact ?? null,
        propertyOfInterest: leadData.propertyOfInterest ?? null,
        preferredVisitTime: leadData.preferredVisitTime ?? null,
      },
    });

    console.log("[VAPI WEBHOOK] VoiceLead creado:", created.id);

    return NextResponse.json({ received: true, debug: "creado con éxito", leadId: created.id });
  } catch (err) {
    console.error("Error en webhook de Vapi:", err);
    return NextResponse.json({ error: "Error interno", debug: String(err) }, { status: 500 });
  }
}