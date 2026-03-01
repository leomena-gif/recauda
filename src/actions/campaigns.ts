'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getCurrentOrg, type ActionResult } from './organization';
import type { Campaign, CampaignFoodItem } from '@/types/database';

// The Database type is hand-written and will be replaced by `npx supabase gen types`.
// Until then, use this helper to bypass insert/update type inference that resolves to never.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

// ─── Schemas ────────────────────────────────────────────────────────────────

const FoodItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  sort_order: z.number().int().optional(),
});

const CreateCampaignSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('raffle'),
    name: z.string().min(1),
    end_date: z.string(),
    start_date: z.string().optional(),
    number_value: z.number().positive(),
    total_numbers: z.number().int().positive(),
    auto_adjust: z.boolean().optional(),
    prizes: z.array(z.string()).optional(),
  }),
  z.object({
    type: z.literal('food_sale'),
    name: z.string().min(1),
    end_date: z.string(),
    start_date: z.string().optional(),
    food_items: z.array(FoodItemSchema).min(1),
  }),
]);

// ─── Types ───────────────────────────────────────────────────────────────────

export type CampaignWithStats = Campaign & {
  sold_numbers: number;
  collected_numbers: number;
  food_items?: CampaignFoodItem[];
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<ActionResult<CampaignWithStats[]>> {
  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  const { data: rawCampaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('organization_id', orgResult.data.id)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };

  const campaigns = (rawCampaigns ?? []) as Campaign[];

  // Fetch item counts per campaign in a single query
  const campaignIds = campaigns.map(c => c.id);

  if (campaignIds.length === 0) return { data: [], error: null };

  const { data: rawItemCounts, error: countError } = await supabase
    .from('items')
    .select('campaign_id, status')
    .in('campaign_id', campaignIds);

  if (countError) return { data: null, error: countError.message };

  const itemCounts = (rawItemCounts ?? []) as { campaign_id: string; status: string }[];

  const withStats: CampaignWithStats[] = campaigns.map(campaign => {
    const campaignItems = itemCounts.filter(i => i.campaign_id === campaign.id);
    return {
      ...campaign,
      sold_numbers: campaignItems.filter(i => i.status === 'sold' || i.status === 'collected').length,
      collected_numbers: campaignItems.filter(i => i.status === 'collected').length,
    };
  });

  return { data: withStats, error: null };
}

export async function createCampaign(
  input: z.infer<typeof CreateCampaignSchema>
): Promise<ActionResult<Campaign>> {
  const parsed = CreateCampaignSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: 'Datos del evento inválidos' };
  }

  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();
  const payload = parsed.data;

  // Insert campaign row
  const campaignInsert =
    payload.type === 'raffle'
      ? {
          organization_id: orgResult.data.id,
          name: payload.name,
          type: 'raffle' as const,
          end_date: payload.end_date || null,
          number_value: payload.number_value,
          total_numbers: payload.total_numbers,
          prizes: payload.prizes ?? [],
        }
      : {
          organization_id: orgResult.data.id,
          name: payload.name,
          type: 'food_sale' as const,
          end_date: payload.end_date || null,
        };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawCampaign, error: campaignError } = await (supabase as any)
    .from('campaigns')
    .insert(campaignInsert)
    .select()
    .single();

  if (campaignError || !rawCampaign) {
    return { data: null, error: campaignError?.message ?? 'Error al crear el evento' };
  }

  const campaign = rawCampaign as unknown as Campaign;

  // For food_sale: insert menu items
  if (payload.type === 'food_sale') {
    const foodItems = payload.food_items.map((item, idx) => ({
      campaign_id: campaign.id,
      name: item.name,
      price: item.price,
      sort_order: item.sort_order ?? idx,
    }));

    const { error: foodError } = await (supabase as AnySupabase)
      .from('campaign_food_items')
      .insert(foodItems);

    if (foodError) {
      return { data: null, error: foodError.message };
    }
  }

  // For raffle: bulk-insert numbered items
  if (payload.type === 'raffle') {
    const items = Array.from({ length: payload.total_numbers }, (_, i) => ({
      campaign_id: campaign.id,
      number: i + 1,
      type: 'raffle_number' as const,
    }));

    const { error: itemsError } = await (supabase as AnySupabase).from('items').insert(items);
    if (itemsError) {
      return { data: null, error: itemsError.message };
    }
  }

  return { data: campaign, error: null };
}

// ─── Seller Stats ────────────────────────────────────────────────────────────

export type SellerStat = {
  seller_id: string;
  seller_name: string;
  assigned: number;
  sold: number;
  collected: number;
  amount_pending: number;
  amount_collected: number;
  pending_item_ids: string[];
};

export async function getSellerStatsForCampaign(
  campaignId: string
): Promise<ActionResult<{ campaign: CampaignWithStats; sellerStats: SellerStat[] }>> {
  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  const { data: rawCampaign, error: campError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('organization_id', orgResult.data.id)
    .single();

  if (campError || !rawCampaign) {
    return { data: null, error: campError?.message ?? 'Evento no encontrado' };
  }

  const campaign = rawCampaign as unknown as Campaign;

  type SellerRow = { seller_id: string; sellers: { first_name: string; last_name: string } | null };
  type ItemRow = { id: string; seller_id: string | null; status: string };

  const [sellersResult, itemsResult] = await Promise.all([
    supabase
      .from('campaign_sellers')
      .select('seller_id, sellers(first_name, last_name)')
      .eq('campaign_id', campaignId),
    supabase
      .from('items')
      .select('id, seller_id, status')
      .eq('campaign_id', campaignId),
  ]);

  if (sellersResult.error) return { data: null, error: sellersResult.error.message };
  if (itemsResult.error) return { data: null, error: itemsResult.error.message };

  const sellerRows = (sellersResult.data ?? []) as unknown as SellerRow[];
  const itemRows = (itemsResult.data ?? []) as unknown as ItemRow[];
  const numberValue = campaign.number_value ?? 0;

  const sellerStats: SellerStat[] = sellerRows.map(sr => {
    const sellerItems = itemRows.filter(i => i.seller_id === sr.seller_id);
    const soldItems = sellerItems.filter(i => i.status === 'sold');
    const collectedItems = sellerItems.filter(i => i.status === 'collected');
    return {
      seller_id: sr.seller_id,
      seller_name: sr.sellers
        ? `${sr.sellers.first_name} ${sr.sellers.last_name}`
        : 'Sin nombre',
      assigned: sellerItems.length,
      sold: soldItems.length,
      collected: collectedItems.length,
      amount_pending: soldItems.length * numberValue,
      amount_collected: collectedItems.length * numberValue,
      pending_item_ids: soldItems.map(i => i.id),
    };
  });

  const allSold = itemRows.filter(i => i.status === 'sold' || i.status === 'collected').length;
  const allCollected = itemRows.filter(i => i.status === 'collected').length;

  return {
    data: {
      campaign: { ...campaign, sold_numbers: allSold, collected_numbers: allCollected },
      sellerStats,
    },
    error: null,
  };
}

export async function updateCampaignStatus(
  id: string,
  status: Campaign['status']
): Promise<ActionResult<Campaign>> {
  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  const { data: rawData, error } = await (supabase as AnySupabase)
    .from('campaigns')
    .update({ status })
    .eq('id', id)
    .eq('organization_id', orgResult.data.id)
    .select()
    .single();

  if (error || !rawData) {
    return { data: null, error: error?.message ?? 'Error al actualizar el estado' };
  }

  return { data: rawData as unknown as Campaign, error: null };
}

export async function getCampaignDetail(
  id: string
): Promise<ActionResult<CampaignWithStats & { food_items: CampaignFoodItem[] }>> {
  const orgResult = await getCurrentOrg();
  if (orgResult.error || !orgResult.data) return { data: null, error: orgResult.error ?? 'Error de autenticación' };

  const supabase = await createClient();

  const { data: rawCampaignDetail, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('organization_id', orgResult.data.id)
    .single();

  if (error || !rawCampaignDetail) {
    return { data: null, error: error?.message ?? 'Evento no encontrado' };
  }

  const campaignDetail = rawCampaignDetail as unknown as Campaign;

  const [itemsResult, foodItemsResult] = await Promise.all([
    supabase.from('items').select('status').eq('campaign_id', id),
    supabase.from('campaign_food_items').select('*').eq('campaign_id', id).order('sort_order'),
  ]);

  const items = (itemsResult.data ?? []) as { status: string }[];
  const foodItems = (foodItemsResult.data ?? []) as CampaignFoodItem[];

  return {
    data: {
      ...campaignDetail,
      sold_numbers: items.filter(i => i.status === 'sold' || i.status === 'collected').length,
      collected_numbers: items.filter(i => i.status === 'collected').length,
      food_items: foodItems,
    },
    error: null,
  };
}
