// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { slugify } from "@/lib/slugify";
import { RESERVED_SLUGS } from "@/lib/reserved-slugs";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limit = await rateLimit({
    key: `register:ip:${getClientIp(req)}`,
    limit: 5,
    windowSeconds: 60 * 60,
  });

  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter);
  }

  try {
    const body = await req.json();
    const { agencyName, slug: rawSlug, name, email, password } = body;

    if (!agencyName || !name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const slug = rawSlug ? slugify(rawSlug) : slugify(agencyName);

    if (!slug) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
    }

    if (RESERVED_SLUGS.includes(slug)) {
      return NextResponse.json({ error: "Ese slug no está disponible" }, { status: 409 });
    }

    const existingSlug = await prisma.agency.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "Ese slug ya está en uso" }, { status: 409 });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Ese email ya está registrado" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: { name: agencyName, slug },
      });

      const user = await tx.user.create({
        data: {
          agencyId: agency.id,
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      await tx.subscription.create({
        data: { agencyId: agency.id, plan: "FREE", status: "active" },
      });

      return { agency, user };
    });

    return NextResponse.json({
      success: true,
      agency: { id: result.agency.id, slug: result.agency.slug },
    });
  } catch (err) {
    console.error("Error en registro:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}