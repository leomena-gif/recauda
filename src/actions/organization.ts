'use server';

import { createClient } from '@/lib/supabase/server';
import type { Organization } from '@/types/database';

export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// Returns the organization belonging to the currently authenticated user.
// All other actions depend on this to scope queries to the right org.
export async function getCurrentOrg(): Promise<ActionResult<Organization>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: 'No autenticado' };
  }

  const { data: rawMemberData, error: memberError } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (memberError || !rawMemberData) {
    return { data: null, error: 'Organización no encontrada' };
  }

  const memberData = rawMemberData as unknown as { organization_id: string };

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', memberData.organization_id)
    .single();

  if (error || !data) {
    return { data: null, error: 'Organización no encontrada' };
  }

  return { data, error: null };
}
