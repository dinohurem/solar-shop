-- Migration: Add discount fields to orders table
-- Date: 2024-12-02

-- Add discount_percentage column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Add constraint to ensure valid discount percentage
ALTER TABLE orders 
ADD CONSTRAINT orders_discount_percentage_check 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Add comment for clarity
COMMENT ON COLUMN orders.discount_percentage IS 'Order discount percentage (0-100)';

-- Update existing records to have default values if they were null
UPDATE orders 
SET discount_percentage = 0.00 
WHERE discount_percentage IS NULL; 