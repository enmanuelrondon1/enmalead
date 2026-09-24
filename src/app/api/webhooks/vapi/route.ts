// cat src/app/api/webhooks/vapi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value: unknown, max = 200): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Webhook Vapi: VAPI_WEBHOOK_SECRET no está configurado");
    return false;
  }

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const provided = req.headers.get("x-vapi-secret") ?? bearer;
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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
      (item: any) => item?.name === "interes_visitante_enmalead",
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
      console.warn(
        "Webhook Vapi: agencyId no coincide con ninguna agencia",
        leadData.agencyId,
      );
      return NextResponse.json({ received: true });
    }

    const name = clean(leadData.name);
    const contact = clean(leadData.contact);
    const propertyOfInterest = clean(leadData.propertyOfInterest);
    const preferredVisitTime = clean(leadData.preferredVisitTime);

    const rawPropertyId =
      clean(leadData.propertyId, 60) ??
      clean(
        message.call?.assistantOverrides?.variableValues?.currentPropertyId,
        60,
      );

    let propertyId: string | null = null;
    let linkedTitle: string | null = null;

    if (rawPropertyId) {
      const linked = await prisma.property.findFirst({
        where: { id: rawPropertyId, agencyId: agency.id },
        select: { id: true, title: true },
      });
      propertyId = linked?.id ?? null;
      linkedTitle = linked?.title ?? null;
    }

    await prisma.voiceLead.create({
      data: {
        agencyId: agency.id,
        propertyId,
        name,
        contact,
        propertyOfInterest: propertyOfInterest ?? linkedTitle,
        preferredVisitTime,
      },
    });
    const adminEmail = agency.users[0]?.email;

    if (adminEmail) {
      const show = (v: string | null) =>
        v ? escapeHtml(v) : "No especificado";

      try {
        await sendEmail({
          to: adminEmail,
          subject: `Nuevo lead capturado en ${agency.name}`,
          html: `
            <p>Tu asistente de voz acaba de capturar un nuevo lead.</p>
            <ul>
              <li><strong>Nombre:</strong> ${show(name)}</li>
              <li><strong>Contacto:</strong> ${show(contact)}</li>
              <li><strong>Propiedad de interés:</strong> ${show(propertyOfInterest)}</li>
              <li><strong>Horario preferido:</strong> ${show(preferredVisitTime)}</li>
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
