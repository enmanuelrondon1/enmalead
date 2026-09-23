// src/components/amenities-input.tsx
"use client";

import { useState } from "react";

type AmenitiesInputProps = {
  amenities: string[];
  onChange: (amenities: string[]) => void;
};

export function AmenitiesInput({ amenities, onChange }: AmenitiesInputProps) {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed || amenities.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...amenities, trimmed]);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (amenity: string) => {
    onChange(amenities.filter((a) => a !== amenity));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Amenidades</label>

      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="flex items-center gap-1 bg-ocean-100 text-ocean-800 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {amenity}
              <button
                type="button"
                onClick={() => handleRemove(amenity)}
                className="hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: piscina, estacionamiento, acepta mascotas"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-800"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="bg-ocean-100 hover:bg-ocean-200 text-ocean-800 text-sm font-medium px-4 rounded-lg transition"
        >
          Agregar
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Presiona Enter o coma para agregar cada amenidad
      </p>
    </div>
  );
}