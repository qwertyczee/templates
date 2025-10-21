# Next.js + Supabase starter

This template ships with a ready-to-use Supabase integration covering authentication, database helpers, and image storage utilities. Configure your project keys, deploy to Vercel, and start building immediately.

## Features

- 🔐 Client and server Supabase clients wired to the Next.js App Router
- 👤 Drop-in email/password auth form using Supabase Auth
- 🗄️ Server helpers for querying and mutating Supabase tables
- 🖼️ Client utilities and UI for uploading images to Supabase Storage
- ⚙️ Environment validation so missing keys are surfaced instantly

## Getting started

1. Install dependencies (choose one):

   ```bash
   bun install
   # or
   npm install
   ```

2. Create a copy of `.env.example` and fill in your Supabase project credentials:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL`: the project URL from Supabase Dashboard → Project Settings → API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the anonymous public key from the same screen
   - `SUPABASE_SERVICE_ROLE_KEY` (optional): used for admin-level server tasks. Keep this key private.

3. In Supabase Dashboard:

   - Enable Email/Password auth (Authentication → Providers → Email)
   - Create a `public` storage bucket named `images` (Storage → Create bucket)
   - Add storage policies so authenticated users can upload, update, and delete files inside that bucket (SQL Editor → New query). If you created policies earlier, drop them first to avoid duplicates:

     ```sql
     -- Optional cleanup (only run if these policies already exist)
     drop policy if exists "Authenticated uploads to images" on storage.objects;
     drop policy if exists "Authenticated select from images" on storage.objects;

     -- Allow signed-in users to upload files to the `images` bucket
     create policy "Authenticated uploads to images"
       on storage.objects for insert
       to authenticated
       with check (bucket_id = 'images');

     -- Allow signed-in users to list/read files from the bucket
     create policy "Authenticated select from images"
       on storage.objects for select
       to authenticated
       using (bucket_id = 'images');
     ```
   - Optionally create the database tables your project needs. The helpers in `src/lib/supabase/database.ts` accept any table name.

4. Start the development server:

   ```bash
   bun dev
   # or
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to explore the demo auth flow and image uploader.

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx                # Supabase provider is registered here
│  └─ page.tsx                  # Demo page showing auth status & storage uploader
├─ components/
│  ├─ providers/
│  │  └─ supabase-provider.tsx  # Browser Supabase client context
│  └─ supabase/
│     ├─ auth-form.tsx          # Email/password auth UI
│     └─ image-uploader.tsx     # Upload images to Supabase Storage
└─ lib/
   └─ supabase/
      ├─ client.ts              # Browser client factory
      ├─ server.ts              # Server client factory
      ├─ database.ts            # Server helpers for table queries & mutations
      ├─ storage.client.ts      # Client-side storage helpers
      ├─ storage.server.ts      # Server helper for signed URLs
      ├─ env.ts                 # Environment variable validation
      └─ types.ts               # Placeholder database types
```

## Using the helpers

- **Authentication** – consume the Supabase client via `useSupabase()` inside client components. The included `SupabaseAuthForm` demonstrates email/password sign-in, sign-up, and sign-out flows.
- **Database** – use the server-only helpers in `src/lib/supabase/database.ts` inside Server Components, Route Handlers, or Server Actions to read/write data while preserving RLS policies.
- **Storage** – use `uploadImage` from `storage.client.ts` to push images to the `images` bucket. For private buckets, pair uploads with the `createSignedImageUrl` helper on the server to render temporary URLs.

## Deployment

Set the same Supabase environment variables in your hosting provider (e.g., Vercel Project Settings → Environment Variables). Redeploy to pick up changes.

For more information, see the [Supabase documentation](https://supabase.com/docs) and the [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying).
