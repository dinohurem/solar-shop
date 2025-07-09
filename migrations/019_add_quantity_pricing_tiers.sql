-- Add quantity-based pricing tiers to company_pricing table
-- This migration adds support for tiered pricing based on order quantity

-- First, check if price_tier_1 already exists to make migration idempotent
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_pricing' 
                 AND column_name = 'price_tier_1') THEN
    -- Rename the existing price column to price_tier_1
    ALTER TABLE company_pricing 
      RENAME COLUMN price TO price_tier_1;
  END IF;
END $$;

-- Add quantity threshold columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_pricing' 
                 AND column_name = 'quantity_tier_1') THEN
    ALTER TABLE company_pricing
      ADD COLUMN quantity_tier_1 INTEGER DEFAULT 1,
      ADD COLUMN quantity_tier_2 INTEGER,
      ADD COLUMN price_tier_2 DECIMAL(10, 2),
      ADD COLUMN quantity_tier_3 INTEGER,
      ADD COLUMN price_tier_3 DECIMAL(10, 2);
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                 WHERE conname = 'check_quantity_tiers_order') THEN
    ALTER TABLE company_pricing
      ADD CONSTRAINT check_quantity_tiers_order 
      CHECK (
        quantity_tier_1 < COALESCE(quantity_tier_2, quantity_tier_1 + 1) AND
        COALESCE(quantity_tier_2, 0) < COALESCE(quantity_tier_3, COALESCE(quantity_tier_2, 0) + 1)
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                 WHERE conname = 'check_tier_2_completeness') THEN
    ALTER TABLE company_pricing
      ADD CONSTRAINT check_tier_2_completeness 
      CHECK (
        (quantity_tier_2 IS NULL AND price_tier_2 IS NULL) OR
        (quantity_tier_2 IS NOT NULL AND price_tier_2 IS NOT NULL)
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                 WHERE conname = 'check_tier_3_completeness') THEN
    ALTER TABLE company_pricing
      ADD CONSTRAINT check_tier_3_completeness 
      CHECK (
        (quantity_tier_3 IS NULL AND price_tier_3 IS NULL) OR
        (quantity_tier_3 IS NOT NULL AND price_tier_3 IS NOT NULL)
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                 WHERE conname = 'check_tier_order') THEN
    ALTER TABLE company_pricing
      ADD CONSTRAINT check_tier_order
      CHECK (
        (quantity_tier_3 IS NULL) OR (quantity_tier_2 IS NOT NULL)
      );
  END IF;
END $$;

-- Update the RLS policies to include the new columns
-- The existing policies should work fine as they operate on row level

-- Add indexes for better query performance if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                 WHERE indexname = 'idx_company_pricing_quantities') THEN
    CREATE INDEX idx_company_pricing_quantities ON company_pricing (quantity_tier_1, quantity_tier_2, quantity_tier_3);
  END IF;
END $$;

-- Add comment explaining the pricing tier structure
COMMENT ON TABLE company_pricing IS 'Stores custom pricing for products per company with quantity-based tiers. Tier 1 is the base price for quantities >= quantity_tier_1. Tier 2 applies for quantities >= quantity_tier_2. Tier 3 applies for quantities >= quantity_tier_3.';