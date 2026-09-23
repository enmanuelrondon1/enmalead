// src/app/dashboard/layout.tsx
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const agency = await prisma.agency.findUnique({
    where: { id: session.user.agencyId },
    select: { slug: true },
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-ocean-950 text-white flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <Link href="/" className="text-lg font-bold hover:text-accent transition">
            EnmaLead
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard/properties"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10 transition"
          >
            Propiedades
          </Link>
          <Link
            href="/dashboard/leads"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10 transition"
          >
            Leads
          </Link>
          <Link
            href="/dashboard/settings"
            className="block rounded-lg px-3 py-2 text-sm hover:bg-white/10 transition"
          >
            Configuración
          </Link>

          {agency && (
            <a
              href={`/${agency.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-accent hover:bg-white/10 transition mt-4 border-t border-white/10 pt-4"
            >
              Ver sitio público ↗
            </a>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <p className="px-3 text-xs text-white/50 mb-2 truncate">
            {session.user.email}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-white/10 transition"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}