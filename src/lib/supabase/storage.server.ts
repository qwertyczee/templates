"use server";

import { createSupabaseServerClient } from "./server";

export async function createSignedImageUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 60 * 60
) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.signedUrl) {
    throw new Error("Failed to create signed URL");
  }

  return data.signedUrl;
}
