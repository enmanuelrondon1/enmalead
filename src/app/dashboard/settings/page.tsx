// src/app/dashboard/settings/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();

  const agency = await prisma.agency.findUnique({
    where: { id: session!.user.agencyId },
    select: { id: true, name: true, slug: true, assistantPrompt: true },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-ocean-950 mb-6">Configuración</h1>
      <SettingsForm agency={agency!} isAdmin={session!.user.role === "ADMIN"} />
    </div>
  );
}