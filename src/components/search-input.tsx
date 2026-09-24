// cat src/components/search-input.tsx
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const lastPushed = useRef(initialQuery.trim());

  useEffect(() => {
    const next = value.trim();
    if (next === lastPushed.current) return;

    const timer = setTimeout(() => {
      lastPushed.current = next;
      startTransition(() => {
        router.replace(next ? `/?q=${encodeURIComponent(next)}` : "/", {
          scroll: false,
        });
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [value, router]);

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="mt-6 max-w-xl"
    >
      <input
        type="search"
        aria-label="Buscar propiedades"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Busca por título, ubicación o agencia"
        className="w-full rounded-lg px-4 py-2.5 text-sm text-ocean-950 bg-white outline-none focus:ring-2 focus:ring-accent"
      />
      <p className="h-4 mt-1.5 text-xs text-white/60">
        {isPending ? "Buscando…" : ""}
      </p>
    </form>
  );
}