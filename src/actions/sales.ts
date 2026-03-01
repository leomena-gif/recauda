'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentOrg, type ActionResult } from './organization';
import type { Sale } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

// ─── Schemas ────────────────────────────────────────────────────────────────

const SaleLineSchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().nonnegative(),
});

const RegisterSaleSchema = z.object({
  campaign_id: z.string().uuid(),
  seller_id: z.string().uuid().optional(),
  buyer_first_name: z.string().min(1),
  buyer_last_name: z.string().min(1),
  buyer_phone: z.string().min(8),
  buyer_email: z.string().email().optional().or(z.literal('')),
  lines: z.array(SaleLineSchema).min(1),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type SaleWithBuyer = Sale & {
  seller_name: string | null;
  item_labels: string[];
  item_ids: string[];
  is_collected: boolean;
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function registerSale(
  input: z.infer<typeof RegisterSaleSchema>
): Promise<ActionResult<Sale>> {
  const parsed = RegisterSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: 'Datos de venta inválidos' };
  }

  const supabase = await createClient();
  const payload = parsed.data;

  const total_amount = payload.lines.reduce(
    (sum, line) => sum + line.unit_price * line.quantity,
    0
  );

  const { data: sale, error: saleError } = await (supabase as AnySupabase)
    .from('sales')
    .insert({
      campaign_id: payload.campaign_id,
      seller_id: payload.seller_id ?? null,
      buyer_name: `${payload.buyer_first_name} ${payload.buyer_last_name}`.trim(),
      buyer_phone: payload.buyer_phone,
      buyer_email: payload.buyer_email || null,
      total_amount,
    })
    .select()
    .single();

  if (saleError || !sale) {
    return { data: null, error: saleError?.message ?? 'Error al registrar la venta' };
  }

  // Link items to this sale
  const saleItems = payload.lines.map(line => ({
    sale_id: sale.id,
    item_id: line.item_id,
    quantity: line.quantity,
    unit_price: line.unit_price,
  }));

  const { error: lineError } = await (supabase as AnySupabase).from('sale_items').insert(saleItems);
  if (lineError) return { data: null, error: lineError.message };

  // Mark items as sold
  const itemIds = payload.lines.map(l => l.item_id);
  const { error: itemError } = await (supabase as AnySupabase)
    .from('items')
    .update({
      status: 'sold',
      seller_id: payload.seller_id ?? null,
    })
    .in('id', itemIds);

  if (itemError) return { data: null, error: itemError.message };

  return { data: sale, error: null };
}

export async function markCollected(itemIds: string[]): Promise<ActionResult<number>> {
  if (itemIds.length === 0) return { data: 0, error: null };

  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  const { error, count } = await (supabase as AnySupabase)
    .from('items')
    .update({ status: 'collected' })
    .in('id', itemIds)
    .eq('status', 'sold');

  if (error) return { data: null, error: error.message };

  return { data: count ?? 0, error: null };
}

export async function listSalesByCampaign(
  campaignId: string
): Promise<ActionResult<SaleWithBuyer[]>> {
  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  const { data: rawData, error } = await supabase
    .from('sales')
    .select(`
      *,
      sellers(first_name, last_name),
      sale_items(item_id, quantity, items(number, type, status))
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };

  type SaleRow = Sale & {
    sellers: { first_name: string; last_name: string } | null;
    sale_items: {
      item_id: string;
      items: { number: number | null; type: string; status: string } | null;
    }[];
  };

  const result: SaleWithBuyer[] = ((rawData ?? []) as unknown as SaleRow[]).map(sale => {
    const seller = sale.sellers;
    const saleLines = sale.sale_items ?? [];
    const isCollected =
      saleLines.length > 0 && saleLines.every(l => l.items?.status === 'collected');

    return {
      ...sale,
      sellers: undefined,
      sale_items: undefined,
      seller_name: seller ? `${seller.first_name} ${seller.last_name}` : null,
      item_ids: saleLines.map(l => l.item_id),
      item_labels: saleLines
        .map(l =>
          l.items?.number != null ? String(l.items.number).padStart(3, '0') : null
        )
        .filter((label): label is string => label !== null),
      is_collected: isCollected,
    };
  });

  return { data: result, error: null };
}
