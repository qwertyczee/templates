import Link from "next/link";

import { SupabaseAuthForm } from "@/components/supabase/auth-form";
import { SupabaseImageUploader } from "@/components/supabase/image-uploader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const currentUser = error ? null : user;

  return (
    <div className="font-sans grid min-h-screen grid-rows-[auto_1fr] gap-12 bg-gradient-to-b from-slate-50 to-white p-8 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-50 sm:p-16">
      <header className="flex w-full max-w-5xl flex-col gap-4">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Supabase powered Next.js starter
        </h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Authentication, database helpers, and image storage utilities are ready to
          go. Configure your Supabase project keys and start building instantly.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
            {currentUser ? `Signed in as ${currentUser.email}` : "Not signed in"}
          </span>
          <Link
            href="https://supabase.com/dashboard/projects"
            className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Open Supabase dashboard
          </Link>
          <Link
            href="https://supabase.com/docs"
            className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Explore the docs
          </Link>
        </div>
      </header>

      <main className="grid w-full max-w-5xl gap-8 sm:grid-cols-2">
        <SupabaseAuthForm />
        <SupabaseImageUploader />
      </main>
    </div>
  );
}
