"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export function Dropzone({ value, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Upload failed");
          return;
        }
        onChange(data.url);
      } catch {
        setError("Network error during upload");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  if (value) {
    return (
      <div className="relative w-full aspect-video rounded-md overflow-hidden border border-gray-700 group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove image"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
          dragging
            ? "border-amber-400 bg-amber-400/5"
            : "border-gray-700 hover:border-gray-500"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 text-amber-400 animate-spin mb-2" />
            <p className="text-gray-400 text-sm">Uploading…</p>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-gray-400 mb-2" />
            <p className="text-gray-300 text-sm">
              Drag an image here, or click to pick
            </p>
            <p className="text-gray-500 text-xs mt-1">
              JPEG, PNG, WebP, AVIF · max 5MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onPick}
          className="hidden"
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}