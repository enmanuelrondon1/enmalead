// src/app/dashboard/settings/settings-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Agency = {
  id: string;
  name: string;
  slug: string;
  assistantPrompt: string | null;
};

export function SettingsForm({ agency, isAdmin }: { agency: Agency; isAdmin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(agency.name);
  const [assistantPrompt, setAssistantPrompt] = useState(agency.assistantPrompt ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/agency/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, assistantPrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al guardar la configuración");
        setSubmitting(false);
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Error al guardar la configuración");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {saved && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          Configuración guardada correctamente
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la agencia
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isAdmin}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL pública
        </label>
        <input
          type="text"
          value={`enmalead.com/${agency.slug}`}
          disabled
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-400 bg-gray-50"
        />
        <p className="text-xs text-gray-400 mt-1">
          La URL de tu agencia no se puede cambiar por ahora
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tono del asistente de voz
        </label>
        <textarea
          value={assistantPrompt}
          onChange={(e) => setAssistantPrompt(e.target.value)}
          disabled={!isAdmin}
          rows={3}
          placeholder="Ej: cálido y cercano, formal y profesional, entusiasta..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1">
          Describe en pocas palabras el tono con el que quieres que hable tu asistente
        </p>
      </div>

      {isAdmin && (
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ocean-800 hover:bg-ocean-950 text-white font-medium rounded-lg py-2.5 transition disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      )}

      {!isAdmin && (
        <p className="text-sm text-gray-400 text-center">
          Solo un administrador puede editar esta configuración
        </p>
      )}
    </form>
  );
}