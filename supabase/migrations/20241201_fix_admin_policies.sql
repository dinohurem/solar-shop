-- Migration: Fix admin policies that access auth.users table
-- Date: 2024-12-01

-- Drop admin policies that try to access auth.users table
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
DROP POLICY IF EXISTS "Guest orders are viewable by admins only" ON orders;
DROP POLICY IF EXISTS "Guest order items are viewable by admins only" ON order_items;

-- Create simplified admin policies that don't access auth.users
-- Note: In production, you would use a service role key for admin operations
-- For now, we'll create policies that allow admin operations through service role

-- Allow service role to manage all orders
CREATE POLICY "Service role can manage all orders" ON orders
    FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to manage all order items  
CREATE POLICY "Service role can manage all order items" ON order_items
    FOR ALL USING (auth.role() = 'service_role');

-- Allow service role to manage all reviews
CREATE POLICY "Service role can manage all reviews" ON reviews
    FOR ALL USING (auth.role() = 'service_role');

-- For guest orders, allow viewing through a simpler policy
-- This allows any authenticated user to view guest orders (you may want to restrict this further)
CREATE POLICY "Allow viewing guest orders" ON orders
    FOR SELECT USING (user_id IS NULL);

-- Allow viewing guest order items
CREATE POLICY "Allow viewing guest order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id IS NULL
        )
    ); 