// src/app/dashboard/leads/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusSelect } from "./status-select";

export default async function LeadsPage() {
  const session = await auth();

  const leads = await prisma.voiceLead.findMany({
    where: { agencyId: session!.user.agencyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ocean-950">Leads</h1>
        <p className="text-sm text-gray-500">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} capturado
          {leads.length !== 1 ? "s" : ""} por el asistente de voz
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Todavía no se ha capturado ningún lead. Los visitantes que hablen con tu
          asistente de voz aparecerán aquí.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Nombre</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Contacto</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">
                  Propiedad de interés
                </th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">
                  Horario preferido
                </th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Fecha</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-ocean-950">
                    {lead.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.contact ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.propertyOfInterest ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.preferredVisitTime ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect leadId={lead.id} status={lead.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}