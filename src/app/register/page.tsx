// src/app/register/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { slugify } from "@/lib/slugify";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function RegisterPage() {
  const router = useRouter();

  const [agencyName, setAgencyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(agencyName));
    }
  }, [agencyName, slugTouched]);

  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle");
      return;
    }

    const cleaned = slugify(slug);
    if (cleaned !== slug) {
      setSlugStatus("invalid");
      return;
    }

    setSlugStatus("checking");

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/agency/check-slug?slug=${encodeURIComponent(slug)}`,
        );
        const data = await res.json();
        setSlugStatus(data.available ? "available" : "taken");
      } catch {
        setSlugStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [slug]);

  const handleSlugChange = useCallback((value: string) => {
    setSlugTouched(true);
    setSlug(value);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (slugStatus === "taken" || slugStatus === "invalid") {
      setError("Revisa el slug de tu agencia antes de continuar");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName, slug, name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Ocurrió un error al registrar");
        setSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Ocurrió un error al registrar");
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
          <h1 className="text-2xl font-bold text-ocean-950">Crea tu agencia</h1>
          <p className="text-sm text-gray-500 mt-1">
            Empieza a capturar leads con tu asistente de voz
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la agencia
          </label>
          <input
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800"
            placeholder="Inmobiliaria del Valle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL de tu agencia
          </label>
          <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-ocean-800">
            <span className="px-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-300">
              enmalead.com/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              className="flex-1 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none"
              placeholder="inmobiliaria-del-valle"
            />
          </div>
          <div className="mt-1 text-xs">
            {slugStatus === "checking" && (
              <span className="text-gray-400">
                Verificando disponibilidad...
              </span>
            )}
            {slugStatus === "available" && (
              <span className="text-green-600">✓ Disponible</span>
            )}
            {slugStatus === "taken" && (
              <span className="text-red-600">Este slug ya está en uso</span>
            )}
            {slugStatus === "invalid" && (
              <span className="text-red-600">
                Solo letras minúsculas, números y guiones
              </span>
            )}
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tu nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800"
          />
        </div>

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
            minLength={8}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800"
          />
        </div>

        <button
          type="submit"
          disabled={
            submitting || slugStatus === "taken" || slugStatus === "invalid"
          }
          className="w-full bg-ocean-800 hover:bg-ocean-950 text-white font-medium rounded-lg py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            className="text-ocean-800 font-medium hover:underline"
          >
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
}
