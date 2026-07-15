"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useToast } from "@jisp/ui";

export interface UploadedImage {
  url: string;
  isMain: boolean;
}

export function ImageUploader({
  images,
  onChange,
  folder = "products",
  label = "Product Images",
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: UploadedImage[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || "Upload failed.", "error");
          continue;
        }
        uploaded.push({ url: data.url, isMain: images.length === 0 && uploaded.length === 0 });
      } catch {
        showToast("Upload failed. Please try again.", "error");
      }
    }
    onChange([...images, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function setMain(idx: number) {
    onChange(images.map((img, i) => ({ ...img, isMain: i === idx })));
  }

  function removeImage(idx: number) {
    const next = images.filter((_, i) => i !== idx);
    if (next.length && !next.some((i) => i.isMain)) next[0].isMain = true;
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-wider text-jisp-dark">{label}</span>
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div key={img.url} className="relative h-24 w-20 group">
            <Image src={img.url} alt="" fill className="object-cover" />
            {img.isMain && (
              <span className="absolute top-0 left-0 bg-jisp-black text-white text-[9px] px-1">Main</span>
            )}
            <div className="absolute inset-0 bg-jisp-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              {!img.isMain && (
                <button
                  type="button"
                  onClick={() => setMain(idx)}
                  className="text-white text-[10px] underline"
                >
                  Set Main
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="text-white text-[10px] underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-24 w-20 border border-dashed border-jisp-grey flex items-center justify-center text-xs text-jisp-grey hover:border-jisp-blue disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "+ Add"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
