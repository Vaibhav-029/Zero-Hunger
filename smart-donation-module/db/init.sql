-- Smart Charity & Humanitarian Donation System (Hackathon MVP)
-- PostgreSQL schema + demo seed data

CREATE TABLE IF NOT EXISTS ngo (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  urgency_level   INT  NOT NULL DEFAULT 1 CHECK (urgency_level BETWEEN 1 AND 10),
  total_funds     BIGINT NOT NULL DEFAULT 0, -- stored in paise for accuracy
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  city            TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign (
  id              BIGSERIAL PRIMARY KEY,
  ngo_id           BIGINT NOT NULL REFERENCES ngo(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  goal_amount     BIGINT NOT NULL,           -- paise
  raised_amount   BIGINT NOT NULL DEFAULT 0, -- paise
  ends_at         TIMESTAMPTZ NOT NULL,
  is_emergency    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donation (
  id                BIGSERIAL PRIMARY KEY,
  donor_name        TEXT NOT NULL,
  anonymous         BOOLEAN NOT NULL DEFAULT FALSE,
  ngo_id            BIGINT REFERENCES ngo(id) ON DELETE SET NULL,
  campaign_id       BIGINT REFERENCES campaign(id) ON DELETE SET NULL,
  amount            BIGINT NOT NULL, -- paise
  currency          TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT,
  transaction_id    TEXT, -- razorpay_payment_id
  payment_signature TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'CREATED', -- CREATED | PAID | FAILED
  meals_funded      INT NOT NULL DEFAULT 0,
  message           TEXT,
  impact_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donation_created_at ON donation(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donation_ngo_id ON donation(ngo_id);
CREATE INDEX IF NOT EXISTS idx_donation_campaign_id ON donation(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_ngo_id ON campaign(ngo_id);

-- Demo NGOs
INSERT INTO ngo (name, description, urgency_level, total_funds, verified, city, latitude, longitude)
VALUES
  ('Hope Shelter', 'Night meal drives for children and homeless families.', 9, 5420000, TRUE, 'Mumbai', 19.0760, 72.8777),
  ('GreenPlate Rescue', 'Rescues surplus food from events and redistributes locally.', 6, 1785000, TRUE, 'Pune', 18.5204, 73.8567),
  ('Milk for Smiles', 'Milk and nutrition kits for children in high-risk zones.', 8, 920000, FALSE, 'Delhi', 28.6139, 77.2090)
ON CONFLICT DO NOTHING;

-- Demo emergency campaigns
INSERT INTO campaign (ngo_id, title, description, goal_amount, raised_amount, ends_at, is_emergency)
SELECT id,
       '50 children need meals tonight',
       'Emergency hunger relief required for tonight’s meal drive.',
       10000000,
       5420000,
       now() + interval '8 hours',
       TRUE
FROM ngo
WHERE name = 'Hope Shelter'
ON CONFLICT DO NOTHING;

