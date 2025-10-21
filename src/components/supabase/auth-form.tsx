"use client";

import { useState, type FormEvent } from "react";

import { useSupabase } from "@/components/providers/supabase-provider";

export function SupabaseAuthForm() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        setMessage("Signed in successfully.");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        setMessage("Check your inbox to confirm your account.");
      }
    } catch (formError) {
      const errorMessage =
        formError instanceof Error ? formError.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    setError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      setMessage("Signed out successfully.");
    } catch (formError) {
      const errorMessage =
        formError instanceof Error ? formError.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Supabase Auth</h2>
        <button
          type="button"
          className="text-sm underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          Switch to {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-sm">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Password
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded border px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-60 dark:bg-white dark:text-black"
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <button
        type="button"
        className="text-sm underline"
        onClick={handleSignOut}
        disabled={loading}
      >
        Sign out
      </button>

      {message ? (
        <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
