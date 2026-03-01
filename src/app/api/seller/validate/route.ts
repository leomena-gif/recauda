import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

// Validates a seller portal magic link token.
// Uses the admin client (service role) to bypass RLS — the token itself is the auth.
//
// GET /api/seller/validate?token=XXX
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
  }

  const supabase = createAdminClient() as AnySupabase;

  const { data: tokenRow, error } = await supabase
    .from('seller_tokens')
    .select(`
      *,
      sellers(*),
      campaigns(*, campaign_food_items(*))
    `)
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !tokenRow) {
    return NextResponse.json(
      { error: 'El link expiró o no es válido' },
      { status: 404 }
    );
  }

  // Fetch items assigned to this seller for this campaign
  const { data: items } = await supabase
    .from('items')
    .select('*, sale_items(sales(buyer_first_name, buyer_last_name, buyer_phone))')
    .eq('campaign_id', tokenRow.campaign_id)
    .eq('seller_id', tokenRow.seller_id)
    .order('number_label', { ascending: true });

  // Mark token as used on first access (if not already marked)
  if (!tokenRow.used_at) {
    await supabase
      .from('seller_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenRow.id);
  }

  return NextResponse.json({
    seller: tokenRow.sellers,
    campaign: tokenRow.campaigns,
    items: items ?? [],
    token_id: tokenRow.id,
  });
}
