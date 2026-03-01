-- ============================================================
-- Recauda — Initial Schema Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CUSTOM ENUM TYPES
-- ============================================================
CREATE TYPE campaign_type   AS ENUM ('raffle', 'food_sale');
CREATE TYPE campaign_status AS ENUM ('active', 'inactive', 'completed', 'cancelled');
CREATE TYPE item_status     AS ENUM ('available', 'sold', 'collected');
CREATE TYPE seller_status   AS ENUM ('active', 'inactive');

-- ============================================================
-- TABLE: organizations
-- Multi-tenant root. One org per organizer account.
-- Auto-created by trigger on auth.users insert (see below).
-- ============================================================
CREATE TABLE organizations (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  slug       TEXT        UNIQUE NOT NULL,
  owner_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  phone      TEXT,
  country    TEXT        NOT NULL DEFAULT 'AR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);

-- ============================================================
-- TABLE: org_members
-- Allows multiple admins per organization (future-proof).
-- ============================================================
CREATE TABLE org_members (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_id  ON org_members(organization_id);

-- ============================================================
-- TABLE: campaigns
-- Replaces the frontend "Event" model.
-- ============================================================
CREATE TABLE campaigns (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID            NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT            NOT NULL,
  type            campaign_type   NOT NULL,
  status          campaign_status NOT NULL DEFAULT 'active',

  -- Raffle-specific (null for food_sale)
  number_value    NUMERIC(10,2),
  total_numbers   INTEGER,
  auto_adjust     BOOLEAN         DEFAULT TRUE,
  prizes          TEXT[],

  -- Food sale items stored in campaign_food_items table

  start_date DATE,
  end_date   DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_org_id ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- ============================================================
-- TABLE: campaign_food_items
-- Menu dishes for food_sale campaigns.
-- ============================================================
CREATE TABLE campaign_food_items (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_items_campaign_id ON campaign_food_items(campaign_id);

-- ============================================================
-- TABLE: sellers
-- NOT auth.users — sellers have no Supabase account.
-- Access only via seller_tokens magic links.
-- ============================================================
CREATE TABLE sellers (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID          NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name      TEXT          NOT NULL,
  last_name       TEXT          NOT NULL,
  phone           TEXT          NOT NULL,
  email           TEXT,
  status          seller_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sellers_org_id ON sellers(organization_id);
CREATE INDEX idx_sellers_status ON sellers(status);

-- ============================================================
-- TABLE: campaign_sellers
-- Junction: which sellers are assigned to which campaigns.
-- ============================================================
CREATE TABLE campaign_sellers (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  seller_id   UUID        NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, seller_id)
);

CREATE INDEX idx_campaign_sellers_campaign_id ON campaign_sellers(campaign_id);
CREATE INDEX idx_campaign_sellers_seller_id   ON campaign_sellers(seller_id);

-- ============================================================
-- TABLE: seller_tokens
-- Time-limited tokens (7 days) for seller portal magic link access.
-- NOT Supabase Auth — custom token system to avoid inviting
-- non-technical sellers into an auth system.
-- ============================================================
CREATE TABLE seller_tokens (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID        NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  campaign_id UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  token       TEXT        UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seller_tokens_token     ON seller_tokens(token);
CREATE INDEX idx_seller_tokens_seller_id ON seller_tokens(seller_id);

-- ============================================================
-- TABLE: items
-- Individual raffle numbers OR food portions.
-- Status machine: available → sold → collected
-- ============================================================
CREATE TABLE items (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id  UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  number_label TEXT,                  -- raffle: "042"; food_sale: null
  food_item_id UUID        REFERENCES campaign_food_items(id) ON DELETE SET NULL,
  status       item_status NOT NULL DEFAULT 'available',
  seller_id    UUID        REFERENCES sellers(id) ON DELETE SET NULL,
  sold_at      TIMESTAMPTZ,
  collected_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_campaign_id  ON items(campaign_id);
CREATE INDEX idx_items_seller_id    ON items(seller_id);
CREATE INDEX idx_items_status       ON items(status);
CREATE INDEX idx_items_food_item_id ON items(food_item_id);

-- ============================================================
-- TABLE: sales
-- One sale = one buyer transaction (one buyer buys N items).
-- ============================================================
CREATE TABLE sales (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id      UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  seller_id        UUID        REFERENCES sellers(id) ON DELETE SET NULL,
  buyer_first_name TEXT        NOT NULL,
  buyer_last_name  TEXT        NOT NULL,
  buyer_phone      TEXT        NOT NULL,
  buyer_email      TEXT,
  quantity         INTEGER,           -- raffle: number of tickets; food_sale: null
  total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  receipt_sent_at  TIMESTAMPTZ,
  receipt_url      TEXT,              -- Supabase Storage URL for PDF
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_campaign_id ON sales(campaign_id);
CREATE INDEX idx_sales_seller_id   ON sales(seller_id);

-- ============================================================
-- TABLE: sale_items
-- Links a sale to its specific items.
-- ============================================================
CREATE TABLE sale_items (
  id         UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id    UUID          NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  item_id    UUID          NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
  quantity   INTEGER       NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  UNIQUE(sale_id, item_id)
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_item_id ON sale_items(item_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at on modified rows
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sellers_updated_at
  BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_sales_updated_at
  BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create organization when a new user signs up via magic link.
-- org_name and phone are passed via raw_user_meta_data during signInWithOtp.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  base_slug  TEXT;
  final_slug TEXT;
  counter    INTEGER := 0;
BEGIN
  -- Build a URL-safe slug from org_name
  base_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.raw_user_meta_data->>'org_name', 'org'),
    '[^a-z0-9]+', '-', 'g'
  ));
  final_slug := base_slug;

  -- Ensure slug uniqueness by appending a counter if needed
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO organizations (name, slug, owner_id, phone)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'org_name', 'Mi Organización'),
    final_slug,
    NEW.id,
    NEW.raw_user_meta_data->>'phone'
  )
  RETURNING id INTO new_org_id;

  INSERT INTO org_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sellers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_tokens       ENABLE ROW LEVEL SECURITY;
ALTER TABLE items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales               ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items          ENABLE ROW LEVEL SECURITY;

-- Helper: returns the organization IDs the current user belongs to.
-- Used by all RLS policies to avoid repeated subqueries.
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM org_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- organizations
CREATE POLICY "org_select" ON organizations
  FOR SELECT USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "org_update" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- org_members
CREATE POLICY "org_members_select" ON org_members
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "org_members_insert" ON org_members
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

-- campaigns
CREATE POLICY "campaigns_select" ON campaigns
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "campaigns_insert" ON campaigns
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "campaigns_update" ON campaigns
  FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "campaigns_delete" ON campaigns
  FOR DELETE USING (organization_id IN (SELECT get_user_org_ids()));

-- campaign_food_items
CREATE POLICY "food_items_all" ON campaign_food_items
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- sellers
CREATE POLICY "sellers_select" ON sellers
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "sellers_insert" ON sellers
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "sellers_update" ON sellers
  FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

-- campaign_sellers
CREATE POLICY "campaign_sellers_all" ON campaign_sellers
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- seller_tokens (org admins read/create; validation uses service role)
CREATE POLICY "seller_tokens_select" ON seller_tokens
  FOR SELECT USING (
    seller_id IN (SELECT id FROM sellers WHERE organization_id IN (SELECT get_user_org_ids()))
  );

CREATE POLICY "seller_tokens_insert" ON seller_tokens
  FOR INSERT WITH CHECK (
    seller_id IN (SELECT id FROM sellers WHERE organization_id IN (SELECT get_user_org_ids()))
  );

-- items
CREATE POLICY "items_all" ON items
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- sales
CREATE POLICY "sales_all" ON sales
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE organization_id IN (SELECT get_user_org_ids())
    )
  );

-- sale_items
CREATE POLICY "sale_items_all" ON sale_items
  USING (
    sale_id IN (
      SELECT id FROM sales WHERE campaign_id IN (
        SELECT id FROM campaigns WHERE organization_id IN (SELECT get_user_org_ids())
      )
    )
  );

-- ============================================================
-- REALTIME
-- Subscribe to these tables for live dashboard updates.
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE sales;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
