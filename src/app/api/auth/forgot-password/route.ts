// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";
import {
  getClientIp,
  hashKey,
  rateLimit,
  tooManyRequests,
} from "@/lib/rate-limit";

const GENERIC_RESPONSE = {
  success: true,
  message: "Si el email existe, recibirás un enlace para restablecer tu contraseña.",
};

export async function POST(req: NextRequest) {
  const ipLimit = await rateLimit({
    key: `forgot:ip:${getClientIp(req)}`,
    limit: 5,
    windowSeconds: 60 * 60,
  });

  if (!ipLimit.ok) {
    return tooManyRequests(ipLimit.retryAfter);
  }

  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
    }

    const emailLimit = await rateLimit({
      key: `forgot:email:${hashKey(email.trim().toLowerCase())}`,
      limit: 3,
      windowSeconds: 60 * 60,
    });

    if (!emailLimit.ok) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      const userEmail = user.email;

      after(async () => {
        try {
          await sendEmail({
            to: userEmail,
            subject: "Restablece tu contraseña de EnmaLead",
            html: `
              <p>Recibimos una solicitud para restablecer tu contraseña.</p>
              <p><a href="${resetUrl}">Haz clic aquí para crear una nueva contraseña</a></p>
              <p>Este enlace expira en 1 hora. Si no solicitaste esto, puedes ignorar este correo.</p>
            `,
          });
        } catch (emailErr) {
          console.error("Error enviando correo de recuperación:", emailErr);
        }
      });
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("Error en forgot-password:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}