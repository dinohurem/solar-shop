-- Add image column to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Drop all existing RLS policies for offers table
DROP POLICY IF EXISTS "Active offers are viewable by everyone" ON offers;
DROP POLICY IF EXISTS "Users can view offers" ON offers;
DROP POLICY IF EXISTS "Public offers are viewable by everyone" ON offers;
DROP POLICY IF EXISTS "Users can view all offers" ON offers;
DROP POLICY IF EXISTS "Admins can manage offers" ON offers;

-- Remove the is_active column from offers table (if it exists)
ALTER TABLE offers DROP COLUMN IF EXISTS is_active;

-- Recreate simplified RLS policies without is_active dependency
CREATE POLICY "Public offers are viewable by everyone" ON offers
    FOR SELECT USING (true);

CREATE POLICY "Users can view all offers" ON offers
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admins to manage offers
CREATE POLICY "Admins can manage offers" ON offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );