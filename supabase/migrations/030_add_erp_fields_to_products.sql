-- Migration: Add ERP integration fields to products table
-- Description: Adds unit_id (radna jedinica - work unit/location code) field
-- for ERP system integration to track stock numbers
-- Note: ERP's 'artikl' parameter maps to the existing 'sku' field (šifra artikla)

-- Add unit_id field (ERP radna jedinica / šifra radne jedinice)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_id TEXT;

-- Create index for faster ERP lookups by unit_id
CREATE INDEX IF NOT EXISTS idx_products_unit_id ON products(unit_id) WHERE unit_id IS NOT NULL;

-- Create composite index for combined lookups (šifra artikla + šifra radne jedinice)
CREATE INDEX IF NOT EXISTS idx_products_erp_codes ON products(sku, unit_id) WHERE unit_id IS NOT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN products.unit_id IS 'ERP system šifra radne jedinice (work unit/location code) for stock synchronization';
