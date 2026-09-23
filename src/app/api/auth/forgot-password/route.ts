// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: "Restablece tu contraseña de EnmaLead",
        html: `
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p><a href="${resetUrl}">Haz clic aquí para crear una nueva contraseña</a></p>
          <p>Este enlace expira en 1 hora. Si no solicitaste esto, puedes ignorar este correo.</p>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Si el email existe, recibirás un enlace para restablecer tu contraseña.",
    });
  } catch (err) {
    console.error("Error en forgot-password:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}