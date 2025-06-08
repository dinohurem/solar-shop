-- Migration: Fix RLS policies for guest orders
-- Date: 2024-12-01

-- Drop existing restrictive policies for orders
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Guest users can create orders" ON orders;

-- Drop existing restrictive policies for order items
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can create order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Guest users can create order items for guest orders" ON order_items;

-- Drop existing view policies that might conflict
DROP POLICY IF EXISTS "Guest orders are viewable by admins only" ON orders;
DROP POLICY IF EXISTS "Guest order items are viewable by admins only" ON order_items;

-- Create new policies for orders that allow both authenticated users and guest orders
CREATE POLICY "Authenticated users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guest users can create orders" ON orders
    FOR INSERT WITH CHECK (user_id IS NULL);

-- Create new policies for order items that support guest orders
CREATE POLICY "Authenticated users can create order items for their orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Guest users can create order items for guest orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id IS NULL
        )
    );

-- Add policy for guests to view their orders (admins only)
CREATE POLICY "Guest orders are viewable by admins only" ON orders
    FOR SELECT USING (
        user_id IS NULL AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Add policy for guests to view their order items (admins only)
CREATE POLICY "Guest order items are viewable by admins only" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id IS NULL
        ) AND
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );