import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PostHogProvider } from "@/components/providers/posthog-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Supabase Ready Template",
  description: "Next.js template with Supabase auth, database, and storage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50`}
      >
        <PostHogProvider>
          <SupabaseProvider>{children}</SupabaseProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
