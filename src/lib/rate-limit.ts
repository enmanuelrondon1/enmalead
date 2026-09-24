// src/lib/rate-limit.ts
import { NextRequest, NextResponse, after } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  ok: boolean;
  retryAfter: number;
};

export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}

export function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function scheduleCleanup() {
  try {
    after(async () => {
      try {
        await prisma.rateLimit.deleteMany({
          where: { resetAt: { lt: new Date() } },
        });
      } catch {
        // la limpieza es opcional
      }
    });
  } catch {
    // fuera de un contexto de petición no se limpia
  }
}

export async function rateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<{ count: number; secondsLeft: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (
        ${key},
        1,
        (NOW() AT TIME ZONE 'UTC') + (${windowSeconds}::float8 * INTERVAL '1 second')
      )
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."resetAt" <= (NOW() AT TIME ZONE 'UTC') THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimit"."resetAt" <= (NOW() AT TIME ZONE 'UTC')
            THEN (NOW() AT TIME ZONE 'UTC') + (${windowSeconds}::float8 * INTERVAL '1 second')
          ELSE "RateLimit"."resetAt"
        END
      RETURNING
        "count",
        CEIL(EXTRACT(EPOCH FROM ("resetAt" - (NOW() AT TIME ZONE 'UTC'))))::int AS "secondsLeft"
    `;

    const row = rows[0];
    const count = Number(row.count);
    const retryAfter = Math.max(1, Number(row.secondsLeft));

    if (Math.random() < 0.02) scheduleCleanup();

    return { ok: count <= limit, retryAfter };
  } catch (err) {
    console.error("Error en rateLimit (se permite la petición):", err);
    return { ok: true, retryAfter: 0 };
  }
}

export function tooManyRequests(
  retryAfter: number,
  extra: Record<string, unknown> = {}
) {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));

  return NextResponse.json(
    {
      ...extra,
      error: `Demasiados intentos. Inténtalo de nuevo en ${minutes} ${
        minutes === 1 ? "minuto" : "minutos"
      }.`,
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}