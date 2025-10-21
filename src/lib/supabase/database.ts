"use server";

import { createSupabaseServerClient } from "./server";

export async function fetchTableRows<T = unknown>(
  table: string,
  query: string = "*",
  limit = 10
) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from<T>(table)
    .select(query)
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertRow<T extends Record<string, unknown>>(
  table: string,
  values: T
) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.from(table).upsert(values).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data as T;
}
