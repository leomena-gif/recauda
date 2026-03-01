// This file is the source of truth for Supabase database types.
// Once the Supabase project is set up, regenerate with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      org_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: 'owner' | 'admin';
          full_name: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: 'owner' | 'admin';
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          type: 'raffle' | 'food_sale';
          status: 'active' | 'completed' | 'cancelled';
          number_value: number | null;
          total_numbers: number | null;
          prizes: string[] | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          type: 'raffle' | 'food_sale';
          status?: 'active' | 'completed' | 'cancelled';
          number_value?: number | null;
          total_numbers?: number | null;
          prizes?: string[] | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      campaign_food_items: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          price: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          price: number;
          sort_order?: number;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      sellers: {
        Row: {
          id: string;
          organization_id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          email?: string | null;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      campaign_sellers: {
        Row: {
          id: string;
          campaign_id: string;
          seller_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          seller_id: string;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      seller_tokens: {
        Row: {
          id: string;
          seller_id: string;
          campaign_id: string;
          token: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          campaign_id: string;
          token?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          campaign_id: string;
          seller_id: string | null;
          number: number | null;
          type: 'raffle_number' | 'food_item';
          food_item_id: string | null;
          status: 'available' | 'sold' | 'collected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          seller_id?: string | null;
          number?: number | null;
          type?: 'raffle_number' | 'food_item';
          food_item_id?: string | null;
          status?: 'available' | 'sold' | 'collected';
          created_at?: string;
          updated_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          campaign_id: string;
          seller_id: string | null;
          buyer_name: string;
          buyer_phone: string | null;
          buyer_email: string | null;
          total_amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          seller_id?: string | null;
          buyer_name: string;
          buyer_phone?: string | null;
          buyer_email?: string | null;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          item_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          item_id: string;
          quantity?: number;
          unit_price: number;
          created_at?: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Update: Record<string, any>;
        Relationships: [];
      };
    };
    Views: Record<string, unknown>;
    Functions: {
      get_user_org_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
    };
    Enums: {
      campaign_type: 'raffle' | 'food_sale';
      campaign_status: 'active' | 'completed' | 'cancelled';
      item_status: 'available' | 'sold' | 'collected';
      seller_status: 'active' | 'inactive';
    };
  };
};

// Convenience row types
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type CampaignFoodItem = Database['public']['Tables']['campaign_food_items']['Row'];
export type Seller = Database['public']['Tables']['sellers']['Row'];
export type CampaignSeller = Database['public']['Tables']['campaign_sellers']['Row'];
export type SellerToken = Database['public']['Tables']['seller_tokens']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];
