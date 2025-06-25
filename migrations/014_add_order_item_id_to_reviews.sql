-- Migration: Add order_item_id to reviews table
-- Date: 2024-12-01
-- Description: Adds order_item_id column to reviews table to link reviews to specific order items

-- Add order_item_id column to reviews table
ALTER TABLE reviews 
ADD COLUMN order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL;

-- Drop the existing unique constraint
ALTER TABLE reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_product_id_order_id_key;

-- Add new unique constraint that includes order_item_id
ALTER TABLE reviews 
ADD CONSTRAINT reviews_user_id_product_id_order_item_id_key 
UNIQUE(user_id, product_id, order_item_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_order_item_id ON reviews(order_item_id);

-- Update RLS policies to include order_item_id
DROP POLICY IF EXISTS "Users can create reviews for their purchases" ON reviews;

CREATE POLICY "Users can create reviews for their purchases" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.user_id = auth.uid() 
            AND oi.product_id = reviews.product_id
            AND oi.id = reviews.order_item_id
            AND o.status = 'delivered'
        )
    );

-- Add comment to explain the new column
COMMENT ON COLUMN reviews.order_item_id IS 'References the specific order item that was reviewed, allowing multiple reviews for the same product from different orders'; 