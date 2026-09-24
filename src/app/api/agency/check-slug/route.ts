// src/app/api/agency/check-slug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RESERVED_SLUGS } from "@/lib/reserved-slugs";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limit = await rateLimit({
    key: `check-slug:ip:${getClientIp(req)}`,
    limit: 60,
    windowSeconds: 60,
  });

  if (!limit.ok) {
    return tooManyRequests(limit.retryAfter, { available: false });
  }

  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ available: false, error: "Slug requerido" }, { status: 400 });
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json({ available: false });
  }

  const existing = await prisma.agency.findUnique({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json({ available: !existing });
}