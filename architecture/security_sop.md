# Security SOP: Supabase Keys & The Frontend

Because we are using a "Frontend API" heavy approach (Next.js), it is essential to understand how Supabase secures data so we do not expose sensitive privileges.

## The Two Keys

When you create a Supabase project, you get two main keys:

1. **`NEXT_PUBLIC_SUPABASE_ANON_KEY` (Safe for Frontend)**
   - This key goes into your Next.js application and is **visible to the public**.
   - It only has the permissions of an anonymous user or a logged-in user (based on their JWT token).
   - **Protection:** It relies 100% on Row Level Security (RLS) policies in the database. If RLS is configured correctly, a hacker using this key cannot read or modify data that doesn't belong to them.

2. **`SUPABASE_SERVICE_ROLE_KEY` (DANGEROUS - Backend Only)**
   - This key **bypasses all Row Level Security (RLS)**. It has root/admin access to the entire database.
   - It must **never** be exposed to the frontend (do not prefix with `NEXT_PUBLIC_`).
   - **Usage:** It is only used in secure backend environments (like Supabase Edge Functions, Node.js backend cron jobs, or our deterministic Python scripts in the `tools/` folder).

## Our Anti-Exploit Strategy

To prevent the hacks you mentioned:
- We will rigorously define Postgres RLS Policies for every table.
- Students will only be able to UPDATE their own rows.
- Sensitive values like `xp` and `rank` will be locked from client-side updates entirely. If a user tries to send an API request saying `xp = 9999`, the database will reject it.
- **Server Authority:** XP is awarded via internal Supabase Triggers (running directly on the DB server) when a valid `response` is created.

## What I need from you

When you are ready, please create a Supabase project (it's free) and drop the **URL** and the **ANON KEY** into our `.env` file (I will create a placeholder for you shortly). Keep the Service Role key to yourself unless we explicitly need a backend Python script to use it.
