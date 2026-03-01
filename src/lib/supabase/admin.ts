import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Service role client — bypasses RLS entirely.
// ONLY import in Route Handlers or Server Actions — never in client components.
// Used for:
//   - Seller portal token validation (unauthenticated requests)
//   - WhatsApp webhook processing
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
