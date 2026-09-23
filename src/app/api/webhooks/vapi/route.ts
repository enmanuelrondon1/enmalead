// src/app/api/webhooks/vapi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

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

    const agency = await prisma.agency.findUnique({
      where: { id: leadData.agencyId },
      include: {
        users: {
          where: { role: "ADMIN" },
          select: { email: true },
          take: 1,
        },
      },
    });

    if (!agency) {
      console.warn("Webhook Vapi: agencyId no coincide con ninguna agencia", leadData.agencyId);
      return NextResponse.json({ received: true });
    }

    await prisma.voiceLead.create({
      data: {
        agencyId: leadData.agencyId,
        name: leadData.name ?? null,
        contact: leadData.contact ?? null,
        propertyOfInterest: leadData.propertyOfInterest ?? null,
        preferredVisitTime: leadData.preferredVisitTime ?? null,
      },
    });

    const adminEmail = agency.users[0]?.email;

    if (adminEmail) {
      try {
        await sendEmail({
          to: adminEmail,
          subject: `Nuevo lead capturado en ${agency.name}`,
          html: `
            <p>Tu asistente de voz acaba de capturar un nuevo lead.</p>
            <ul>
              <li><strong>Nombre:</strong> ${leadData.name ?? "No especificado"}</li>
              <li><strong>Contacto:</strong> ${leadData.contact ?? "No especificado"}</li>
              <li><strong>Propiedad de interés:</strong> ${leadData.propertyOfInterest ?? "No especificado"}</li>
              <li><strong>Horario preferido:</strong> ${leadData.preferredVisitTime ?? "No especificado"}</li>
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads">Ver todos tus leads</a></p>
          `,
        });
      } catch (emailErr) {
        console.error("Error enviando notificación de lead:", emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error en webhook de Vapi:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}