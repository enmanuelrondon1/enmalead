// src/app/dashboard/properties/delete-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer.")) {
      return;
    }

    setDeleting(true);

    const res = await fetch(`/api/properties/${propertyId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("No se pudo eliminar la propiedad");
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {deleting ? "Eliminando..." : "Eliminar"}
    </button>
  );
}