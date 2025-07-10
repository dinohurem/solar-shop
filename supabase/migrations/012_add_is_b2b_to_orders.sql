-- Migration: Add is_b2b flag to orders table
-- This flag distinguishes between B2C orders (false) and B2B/partner orders (true)

ALTER TABLE orders 
ADD COLUMN is_b2b BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX idx_orders_is_b2b ON orders(is_b2b);

-- Add comment to document the column purpose
COMMENT ON COLUMN orders.is_b2b IS 'Flag to distinguish B2B/partner orders (true) from regular B2C orders (false)'; 