import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./env";
import type { Database } from "./types";

export function createSupabaseServerClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = cookies();

  const typedStore = cookieStore as unknown as {
    get(name: string): { value: string } | undefined;
    set?: (options: CookieOptions & { name: string; value: string }) => void;
    delete?: (options: CookieOptions & { name: string }) => void;
  };

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return typedStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        typedStore.set?.({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        typedStore.delete?.({ name, ...options });
      },
    },
  });
}
