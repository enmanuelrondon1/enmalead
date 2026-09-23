// src/app/forgot-password/page.tsx
"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message ?? "Solicitud enviada");
    } catch {
      setMessage("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ocean-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-ocean-950">Recuperar contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">
            Te enviaremos un enlace para restablecerla
          </p>
        </div>

        {message && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {message}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ocean-800 hover:bg-ocean-950 text-white font-medium rounded-lg py-2.5 transition disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar enlace"}
        </button>

        <p className="text-center text-sm text-gray-500">
          <a href="/login" className="text-ocean-800 font-medium hover:underline">
            Volver a iniciar sesión
          </a>
        </p>
      </form>
    </div>
  );
}