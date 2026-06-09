// Supabase implementation of DataStore. Wire up when the project is created.
//
// Hookup checklist:
//  1. supabase init / link, then apply supabase/migrations/0001_initial_schema.sql
//     and supabase/seed.sql
//  2. npm i @supabase/supabase-js @supabase/ssr
//  3. Fill .env.local from .env.example, set DATA_SOURCE=supabase
//  4. Implement the methods below; key mappings:
//       getFeed      -> rpc('job_feed', { p_trade_id })
//       unlockJob    -> rpc('unlock_job', { p_job_id, p_trade_id })  (atomic 5-cap lives in SQL)
//       createJob    -> insert into jobs (server-side, service role; status pending_review)
//       getJobByToken-> select by manage_token (server-side only, never expose token queries client-side)
//       admin methods-> service role client behind admin auth check
//  5. Switch the export in src/lib/data/index.ts
//
// Auth (Supabase Auth, trades + admin):
//  - trades_people.auth_user_id links the auth user to the trade row
//  - admin via app_metadata role claim, checked in middleware for /admin routes

import type { DataStore } from "./index";

export const supabaseStore: DataStore = new Proxy({} as DataStore, {
  get(_target, prop) {
    throw new Error(
      `supabaseStore.${String(prop)} not implemented yet. Connect Supabase and implement (see comments in src/lib/data/supabase.ts).`
    );
  },
});
