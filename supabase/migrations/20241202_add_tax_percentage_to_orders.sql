-- Migration: Add tax_percentage column to orders table
-- Date: 2024-12-02

-- Add tax_percentage column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5,2) DEFAULT 0.00;

-- Add constraint to ensure valid tax percentage
ALTER TABLE orders 
ADD CONSTRAINT orders_tax_percentage_check 
CHECK (tax_percentage >= 0 AND tax_percentage <= 100);

-- Add comment for clarity
COMMENT ON COLUMN orders.tax_percentage IS 'Tax percentage applied to order (0-100)';

-- Update existing records to have default values if they were null
UPDATE orders 
SET tax_percentage = 0.00 
WHERE tax_percentage IS NULL; 