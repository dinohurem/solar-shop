-- Migration: Add discount support to order_items table
-- Date: 2024-12-02

-- Add discount_amount column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00;

-- Add discount_percentage column to order_items table for reference
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Add comment for clarity
COMMENT ON COLUMN order_items.discount_amount IS 'Discount amount in euros for this order item';
COMMENT ON COLUMN order_items.discount_percentage IS 'Discount percentage (0-100) for this order item';

-- Update existing records to have default values if they were null
UPDATE order_items 
SET discount_amount = 0.00 
WHERE discount_amount IS NULL;

UPDATE order_items 
SET discount_percentage = 0.00 
WHERE discount_percentage IS NULL;

-- Add constraints to ensure valid discount values
ALTER TABLE order_items 
ADD CONSTRAINT order_items_discount_amount_check 
CHECK (discount_amount >= 0);

ALTER TABLE order_items 
ADD CONSTRAINT order_items_discount_percentage_check 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100); 