-- Add ERP stock columns to products table
-- Migration: 032_add_erp_stock_to_products.sql
-- Description: Adds columns to store ERP stock information fetched from external ERP system

-- Add erp_stock column to store total stock across all units
ALTER TABLE products
ADD COLUMN IF NOT EXISTS erp_stock INTEGER DEFAULT NULL;

-- Add erp_stock_updated_at to track when the stock was last synced
ALTER TABLE products
ADD COLUMN IF NOT EXISTS erp_stock_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index on erp_stock_updated_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_products_erp_stock_updated_at
ON products(erp_stock_updated_at DESC);

-- Add comments
COMMENT ON COLUMN products.erp_stock IS 'Total stock quantity across all ERP units/locations. NULL means not synced yet.';
COMMENT ON COLUMN products.erp_stock_updated_at IS 'Timestamp of last ERP stock sync. NULL means never synced.';
