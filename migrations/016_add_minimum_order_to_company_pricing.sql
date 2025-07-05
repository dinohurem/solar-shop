-- Migration: Add minimum_order field to company_pricing table
-- Description: Adds a minimum_order column to track minimum order quantities for company-specific pricing

ALTER TABLE company_pricing 
ADD COLUMN minimum_order INTEGER NOT NULL DEFAULT 1;

-- Add a check constraint to ensure minimum_order is at least 1
ALTER TABLE company_pricing 
ADD CONSTRAINT check_minimum_order_positive CHECK (minimum_order >= 1);

-- Create an index for efficient queries on minimum_order
CREATE INDEX idx_company_pricing_minimum_order ON company_pricing(minimum_order);

-- Add comment for documentation
COMMENT ON COLUMN company_pricing.minimum_order IS 'Minimum order quantity required for this company-specific pricing (default: 1)';