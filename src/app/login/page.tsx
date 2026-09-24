// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.code === "rate_limited"
          ? "Demasiados intentos. Espera unos minutos e inténtalo de nuevo."
          : "Email o contraseña incorrectos"
      );
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ocean-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-ocean-950">Inicia sesión</h1>
          <p className="text-sm text-gray-500 mt-1">
            Accede al dashboard de tu agencia
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ocean-800 hover:bg-ocean-950 text-white font-medium rounded-lg py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-center text-sm text-gray-500">
          <a href="/forgot-password" className="text-ocean-800 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </p>

        <p className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="text-ocean-800 font-medium hover:underline"
          >
            Regístrate
          </a>
        </p>
      </form>
    </div>
  );
}