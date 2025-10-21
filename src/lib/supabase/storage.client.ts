"use client";

import { createSupabaseBrowserClient } from "./client";

export type UploadImageOptions = {
  bucket?: string;
  path?: string;
  cacheControl?: string;
  upsert?: boolean;
};

export async function uploadImage(
  file: File,
  { bucket = "images", path, cacheControl = "3600", upsert = true }: UploadImageOptions = {}
) {
  const supabase = createSupabaseBrowserClient();
  const uniqueSuffix =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const filePath = path ?? `${uniqueSuffix}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl,
      upsert,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.path;
}

export async function listImages(bucket = "images", path = "") {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase.storage.from(bucket).list(path, {
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
