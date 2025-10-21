"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";

import { useSupabase } from "@/components/providers/supabase-provider";
import { uploadImage } from "@/lib/supabase/storage.client";

export function SupabaseImageUploader({ bucket = "images" }: { bucket?: string }) {
  const supabase = useSupabase();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<
    { path: string; publicUrl: string | null }[]
  >([]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const path = await uploadImage(file, { bucket });
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      setUploadedImages((images) => [{ path, publicUrl }, ...images]);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Supabase Storage</h2>
        <label className="cursor-pointer text-sm underline">
          {uploading ? "Uploading..." : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {uploadedImages.length > 0 ? (
        <ul className="grid gap-3">
          {uploadedImages.map((image) => (
            <li key={image.path} className="grid gap-1">
              <span className="text-sm font-medium">{image.path}</span>
              {image.publicUrl ? (
                <Image
                  src={image.publicUrl}
                  alt={`Uploaded image ${image.path}`}
                  width={640}
                  height={360}
                  className="h-48 w-full rounded object-cover"
                />
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bucket is private. Generate a signed URL from the server to display
                  the image.
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload an image to store it in the <span className="font-medium">{bucket}</span> bucket.
        </p>
      )}
    </div>
  );
}
