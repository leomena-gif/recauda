'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentOrg, type ActionResult } from './organization';
import type { Seller, SellerToken } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

// ─── Schemas ────────────────────────────────────────────────────────────────

const CreateSellerSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  campaign_id: z.string().uuid().optional(),
  // Number assignment (relevant when campaign_id is provided)
  quantity: z.number().int().positive().optional(),
  auto_assign: z.boolean().optional(),
  from_number: z.number().int().optional(),
  to_number: z.number().int().optional(),
});

const UpdateSellerSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional().or(z.literal('')),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type SellerWithStats = Seller & {
  events_assigned: number;
  assigned_campaign_ids: string[];
  total_sold: number;
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function listSellers(filters?: {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  campaign_id?: string;
}): Promise<ActionResult<SellerWithStats[]>> {
  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  let query = supabase
    .from('sellers')
    .select(`
      *,
      campaign_sellers(campaign_id),
      items(status)
    `)
    .eq('organization_id', orgResult.data.id)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data: rawData, error } = await query;
  if (error) return { data: null, error: error.message };

  type SellerRow = Seller & {
    campaign_sellers: { campaign_id: string }[];
    items: { status: string }[];
  };

  let sellers: SellerWithStats[] = ((rawData ?? []) as unknown as SellerRow[]).map(seller => {
    const campaignIds = (seller.campaign_sellers ?? []).map(cs => cs.campaign_id);
    const soldItems = (seller.items ?? [])
      .filter(i => i.status === 'sold' || i.status === 'collected');

    return {
      ...seller,
      campaign_sellers: undefined,
      items: undefined,
      events_assigned: campaignIds.length,
      assigned_campaign_ids: campaignIds,
      total_sold: soldItems.length,
    };
  });

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    sellers = sellers.filter(s =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(term) ||
      (s.phone ?? '').includes(term) ||
      (s.email ?? '').toLowerCase().includes(term)
    );
  }

  if (filters?.campaign_id) {
    sellers = sellers.filter(s => s.assigned_campaign_ids.includes(filters.campaign_id!));
  }

  return { data: sellers, error: null };
}

export async function createSeller(
  input: z.infer<typeof CreateSellerSchema>
): Promise<ActionResult<Seller & { token?: string }>> {
  const parsed = CreateSellerSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: 'Datos del vendedor inválidos' };
  }

  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();
  const payload = parsed.data;

  const { data: seller, error: sellerError } = await (supabase as AnySupabase)
    .from('sellers')
    .insert({
      organization_id: orgResult.data.id,
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone,
      email: payload.email || null,
    })
    .select()
    .single();

  if (sellerError || !seller) {
    return { data: null, error: sellerError?.message ?? 'Error al crear el vendedor' };
  }

  let tokenValue: string | undefined;

  // Assign to campaign and generate magic link token
  if (payload.campaign_id) {
    const { error: assignError } = await (supabase as AnySupabase).from('campaign_sellers').insert({
      campaign_id: payload.campaign_id,
      seller_id: seller.id,
    });

    if (assignError) {
      return { data: null, error: assignError.message };
    }

    // Assign items (raffle numbers) to this seller if specified
    if (payload.quantity && !payload.auto_assign) {
      const { error: itemError } = await (supabase as AnySupabase)
        .from('items')
        .update({ seller_id: seller.id })
        .eq('campaign_id', payload.campaign_id)
        .eq('status', 'available')
        .gte('number_label', String(payload.from_number).padStart(3, '0'))
        .lte('number_label', String(payload.to_number).padStart(3, '0'));

      if (itemError) {
        return { data: null, error: itemError.message };
      }
    } else if (payload.quantity && payload.auto_assign) {
      // Auto-assign the next N available items
      const { data: rawAvailableItems } = await supabase
        .from('items')
        .select('id')
        .eq('campaign_id', payload.campaign_id)
        .eq('status', 'available')
        .is('seller_id', null)
        .order('number_label', { ascending: true })
        .limit(payload.quantity);

      const availableItems = (rawAvailableItems ?? []) as { id: string }[];

      if (availableItems.length > 0) {
        const itemIds = availableItems.map(i => i.id);
        await (supabase as AnySupabase)
          .from('items')
          .update({ seller_id: seller.id })
          .in('id', itemIds);
      }
    }

    // Generate magic link token
    const { data: tokenRow } = await (supabase as AnySupabase)
      .from('seller_tokens')
      .insert({ seller_id: seller.id, campaign_id: payload.campaign_id })
      .select('token')
      .single();

    tokenValue = tokenRow?.token;
  }

  return { data: { ...seller, token: tokenValue }, error: null };
}

export async function updateSeller(
  id: string,
  input: z.infer<typeof UpdateSellerSchema>
): Promise<ActionResult<Seller>> {
  const parsed = UpdateSellerSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: 'Datos inválidos' };

  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  const { data, error } = await (supabase as AnySupabase)
    .from('sellers')
    .update(parsed.data)
    .eq('id', id)
    .eq('organization_id', orgResult.data.id)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? 'Error al actualizar el vendedor' };
  }

  return { data, error: null };
}

export async function toggleSellerStatus(id: string): Promise<ActionResult<Seller>> {
  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  const { data: rawCurrent, error: fetchError } = await (supabase as AnySupabase)
    .from('sellers')
    .select('status')
    .eq('id', id)
    .eq('organization_id', orgResult.data.id)
    .single();
  const current = rawCurrent as { status: string } | null;

  if (fetchError || !current) {
    return { data: null, error: 'Vendedor no encontrado' };
  }

  const newStatus = current.status === 'active' ? 'inactive' : 'active';

  const { data, error } = await (supabase as AnySupabase)
    .from('sellers')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? 'Error al cambiar el estado' };
  }

  return { data, error: null };
}

export async function assignSellersToEvent(
  sellerIds: string[],
  campaignId: string
): Promise<ActionResult<SellerToken[]>> {
  if (sellerIds.length === 0) return { data: [], error: null };

  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  // Upsert campaign_sellers (ignore duplicates)
  const assignments = sellerIds.map(seller_id => ({
    campaign_id: campaignId,
    seller_id,
  }));

  const { error: assignError } = await (supabase as AnySupabase)
    .from('campaign_sellers')
    .upsert(assignments, { onConflict: 'campaign_id,seller_id' });

  if (assignError) return { data: null, error: assignError.message };

  // Generate tokens for all newly assigned sellers
  const tokenInserts = sellerIds.map(seller_id => ({
    seller_id,
    campaign_id: campaignId,
  }));

  const { data: tokens, error: tokenError } = await (supabase as AnySupabase)
    .from('seller_tokens')
    .insert(tokenInserts)
    .select();

  if (tokenError) return { data: null, error: tokenError.message };

  return { data: tokens ?? [], error: null };
}
