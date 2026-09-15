// cat src/app/api/agency/check-slug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


const RESERVED_SLUGS = [
   "login", "register", "dashboard", "api", "admin",
   "app", "www", "settings", "auth", "public",
 ];
export async function GET(req: NextRequest) {
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