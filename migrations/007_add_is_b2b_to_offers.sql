-- Migration: Add is_b2b column to offers table
-- This migration adds the is_b2b flag to the offers table to separate B2B offers from B2C offers

-- Add is_b2b column to offers table
ALTER TABLE offers 
ADD COLUMN is_b2b BOOLEAN DEFAULT FALSE;

-- Update the offers table to include original_price and discounted_price for better pricing structure
ALTER TABLE offers 
ADD COLUMN original_price DECIMAL(10,2),
ADD COLUMN discounted_price DECIMAL(10,2);

-- Create index on is_b2b for performance
CREATE INDEX idx_offers_is_b2b ON offers(is_b2b);
CREATE INDEX idx_offers_featured_b2b ON offers(featured, is_b2b);

-- Update existing offers to add pricing structure
UPDATE offers SET 
    original_price = 1000.00,
    discounted_price = 800.00
WHERE discount_type = 'percentage' AND discount_value = 20;

-- Insert sample B2B offers for partner highlights
INSERT INTO offers (
    code,
    title,
    description,
    short_description,
    type,
    status,
    priority,
    featured,
    image_url,
    discount_type,
    discount_value,
    original_price,
    discounted_price,
    auto_apply,
    start_date,
    end_date,
    is_active,
    is_b2b
) VALUES 
(
    'BULK50',
    'Bulk Solar Panel Package - 50% Off Installation',
    'Complete solar panel installation package for commercial properties. Includes 100+ high-efficiency panels, professional installation, and 5-year maintenance.',
    'Bulk solar installation with professional service',
    'bulk_discount',
    'active',
    1,
    true,
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
    'percentage',
    20,
    15000.00,
    12000.00,
    false,
    NOW(),
    '2024-12-31',
    true,
    true
),
(
    'INVERTER20',
    'Premium Inverter Bundle - Limited Time',
    'High-efficiency inverter package with smart monitoring system. Perfect for commercial installations requiring maximum reliability.',
    'Premium inverter with smart monitoring',
    'bundle_deal',
    'active',
    2,
    true,
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop',
    'percentage',
    20,
    8500.00,
    6800.00,
    false,
    NOW(),
    '2024-12-25',
    true,
    true
),
(
    'BATTERY20',
    'Energy Storage Solution - Early Bird Price',
    'Complete battery storage system with 10kWh capacity. Includes installation, monitoring, and 10-year warranty.',
    'Complete battery storage with warranty',
    'first_time_customer',
    'active',
    3,
    false,
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    'percentage',
    20,
    12000.00,
    9600.00,
    false,
    NOW(),
    '2024-12-30',
    true,
    true
),
(
    'TOOLS20',
    'Professional Installation Tools Kit',
    'Complete professional-grade installation tools package for solar installers. Everything needed for efficient installations.',
    'Professional installer tools package',
    'bulk_discount',
    'active',
    4,
    false,
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop',
    'percentage',
    20,
    2500.00,
    2000.00,
    false,
    NOW(),
    '2024-12-28',
    true,
    true
);

-- Update RLS policies to include B2B offers
-- Allow authenticated users to read all offers (both B2C and B2B)
DROP POLICY IF EXISTS "Users can view active offers" ON offers;
CREATE POLICY "Users can view offers" ON offers FOR SELECT 
USING (is_active = true);

-- Allow admins to manage all offers
DROP POLICY IF EXISTS "Admins can manage offers" ON offers;
CREATE POLICY "Admins can manage offers" ON offers FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Add comment for documentation
COMMENT ON COLUMN offers.is_b2b IS 'Flag to indicate if this offer is for B2B partners (true) or B2C customers (false)';
COMMENT ON COLUMN offers.original_price IS 'Original price before discount in the specified currency';
COMMENT ON COLUMN offers.discounted_price IS 'Final price after discount in the specified currency'; 