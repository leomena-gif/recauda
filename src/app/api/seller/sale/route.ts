import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const SaleSchema = z.object({
  token: z.string().min(1),
  campaign_id: z.string().uuid(),
  seller_id: z.string().uuid(),
  buyer_first_name: z.string().min(1),
  buyer_last_name: z.string().min(1),
  buyer_phone: z.string().min(8),
  buyer_email: z.string().email().optional(),
  item_ids: z.array(z.string().uuid()).min(1),
  unit_price: z.number().nonnegative(),
});

// Records a sale from the seller portal (no organizer auth — token-based).
//
// POST /api/seller/sale
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 });
  }

  const parsed = SaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const supabase = createAdminClient() as AnySupabase;
  const payload = parsed.data;

  // Validate that the token is still valid and belongs to this seller+campaign
  const { data: tokenRow, error: tokenError } = await supabase
    .from('seller_tokens')
    .select('id')
    .eq('token', payload.token)
    .eq('seller_id', payload.seller_id)
    .eq('campaign_id', payload.campaign_id)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (tokenError || !tokenRow) {
    return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 401 });
  }

  const total_amount = payload.unit_price * payload.item_ids.length;

  const { data: sale, error: saleError } = await (supabase as AnySupabase)
    .from('sales')
    .insert({
      campaign_id: payload.campaign_id,
      seller_id: payload.seller_id,
      buyer_first_name: payload.buyer_first_name,
      buyer_last_name: payload.buyer_last_name,
      buyer_phone: payload.buyer_phone,
      buyer_email: payload.buyer_email ?? null,
      quantity: payload.item_ids.length,
      total_amount,
    })
    .select()
    .single();

  if (saleError || !sale) {
    return NextResponse.json(
      { error: saleError?.message ?? 'Error al registrar la venta' },
      { status: 500 }
    );
  }

  const saleItems = payload.item_ids.map(item_id => ({
    sale_id: sale.id,
    item_id,
    quantity: 1,
    unit_price: payload.unit_price,
  }));

  const { error: lineError } = await (supabase as AnySupabase).from('sale_items').insert(saleItems);
  if (lineError) {
    return NextResponse.json({ error: lineError.message }, { status: 500 });
  }

  const { error: itemError } = await (supabase as AnySupabase)
    .from('items')
    .update({
      status: 'sold',
      seller_id: payload.seller_id,
      sold_at: new Date().toISOString(),
    })
    .in('id', payload.item_ids);

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  return NextResponse.json({ sale_id: sale.id }, { status: 201 });
}
