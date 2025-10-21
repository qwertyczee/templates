const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseEnv() {
  const missing: string[] = [];

  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing Supabase environment variables: ${missing.join(", ")}. ` +
        "Check your .env file and copy from .env.example."
    );
  }

  return {
    url: SUPABASE_URL!,
    anonKey: SUPABASE_ANON_KEY!,
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
  } as const;
}

export type SupabaseEnv = ReturnType<typeof getSupabaseEnv>;
