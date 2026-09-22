// src/app/dashboard/leads/status-select.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "NEW" | "CONTACTED" | "CLOSED";

const STATUS_LABELS: Record<Status, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  CLOSED: "Cerrado",
};

const STATUS_STYLES: Record<Status, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  CLOSED: "bg-green-100 text-green-800",
};

export function StatusSelect({ leadId, status }: { leadId: string; status: Status }) {
  const router = useRouter();
  const [current, setCurrent] = useState<Status>(status);
  const [updating, setUpdating] = useState(false);

  const handleChange = async (newStatus: Status) => {
    setUpdating(true);
    const previous = current;
    setCurrent(newStatus);

    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      setCurrent(previous);
    } else {
      router.refresh();
    }

    setUpdating(false);
  };

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value as Status)}
      disabled={updating}
      className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-ocean-800 disabled:opacity-50 ${STATUS_STYLES[current]}`}
    >
      {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}