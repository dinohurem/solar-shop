-- Add display_order column to products table for manual ordering
-- Migration: 035_add_display_order_to_products.sql
-- Description: Adds display_order column to allow admins to manually order products

-- Add display_order column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(display_order);

-- Initialize display_order based on existing created_at order
-- This ensures existing products have a sensible initial order
WITH ordered_products AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS new_order
    FROM products
)
UPDATE products
SET display_order = ordered_products.new_order
FROM ordered_products
WHERE products.id = ordered_products.id
AND products.display_order = 0;

-- Add helpful comment
COMMENT ON COLUMN products.display_order IS 'Manual display order for products (lower numbers appear first)';
