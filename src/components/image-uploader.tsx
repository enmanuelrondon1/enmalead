// src/components/image-uploader.tsx
"use client";

import { useState } from "react";

type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
};

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!res.ok) {
          throw new Error("Error al subir imagen");
        }

        const data = await res.json();
        uploaded.push(data.secure_url);
      }

      onChange([...images, ...uploaded]);
    } catch {
      setError("No se pudo subir una o más imágenes. Intenta de nuevo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = (urlToRemove: string) => {
    onChange(images.filter((url) => url !== urlToRemove));
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    onChange(reordered);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes</label>
      <p className="text-xs text-gray-400 mb-2">
        La primera imagen es la que se muestra como portada
      </p>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((url, index) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />

              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-ocean-950/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                  Portada
                </span>
              )}

              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>

              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition pb-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, "left")}
                  disabled={index === 0}
                  className="bg-black/60 text-white rounded w-5 h-5 text-xs flex items-center justify-center disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, "right")}
                  disabled={index === images.length - 1}
                  className="bg-black/60 text-white rounded w-5 h-5 text-xs flex items-center justify-center disabled:opacity-30"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-4 cursor-pointer hover:border-ocean-400 transition text-sm text-gray-500">
        {uploading ? "Subiendo..." : "+ Agregar imágenes"}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
}