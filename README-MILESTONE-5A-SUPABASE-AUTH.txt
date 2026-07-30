BILLi&BoBA NAILS — Milestone 5A: Real Supabase Auth

This patch removes public Customer Preview / Admin Preview behaviour and connects the login page to Supabase Auth.

New files:
- src/lib/auth.ts
- src/lib/supabase/client.ts
- src/lib/supabase/server.ts
- src/lib/supabase/proxy.ts
- src/proxy.ts
- src/app/auth/callback/route.ts
- database/supabase-auth-schema.sql
- .env.example

Replaced files:
- src/components/AuthProvider.tsx
- src/components/AuthGate.tsx
- src/app/login/page.tsx

Before running:
1. Install packages:
   npm.cmd install @supabase/supabase-js @supabase/ssr

2. Create a Supabase project.

3. Run database/supabase-auth-schema.sql in Supabase SQL Editor.

4. Create .env.local in your project root:
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

5. Restart Next.js dev server.

Admin setup:
1. Create your account from /login using your real email.
2. In Supabase SQL Editor run:
   update public.profiles set role = 'admin' where email = 'your-email@example.com';
3. Sign out, then sign in again.
4. You should now enter /admin.

Customers:
- Anyone else who signs up becomes role='customer' by default.
- They go to /account after login.
