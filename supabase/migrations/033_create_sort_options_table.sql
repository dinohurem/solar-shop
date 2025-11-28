-- Create sort_options table for managing product sorting options
-- Migration: 033_create_sort_options_table.sql
-- Description: Creates sort_options table with correct RLS policies
-- This migration is idempotent and can be run multiple times safely

-- Create sort_options table if it doesn't exist
CREATE TABLE IF NOT EXISTS sort_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    label_hr VARCHAR(100) NOT NULL,
    label_en VARCHAR(100) NOT NULL,
    field VARCHAR(50) NOT NULL,
    direction VARCHAR(4) NOT NULL CHECK (direction IN ('asc', 'desc')),
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sort_options_display_order ON sort_options(display_order);
CREATE INDEX IF NOT EXISTS idx_sort_options_is_enabled ON sort_options(is_enabled);
CREATE INDEX IF NOT EXISTS idx_sort_options_is_default ON sort_options(is_default);

-- Enable RLS (Row Level Security)
ALTER TABLE sort_options ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to ensure clean state)
DROP POLICY IF EXISTS "Allow all users to read sort_options" ON sort_options;
DROP POLICY IF EXISTS "Allow admins to update sort_options" ON sort_options;
DROP POLICY IF EXISTS "Allow admins to insert sort_options" ON sort_options;
DROP POLICY IF EXISTS "Allow admins to delete sort_options" ON sort_options;

-- Create policy to allow all users (including anonymous) to read sort_options
CREATE POLICY "Allow all users to read sort_options"
    ON sort_options
    FOR SELECT
    USING (true);

-- Create policy to allow only admins to update sort_options
CREATE POLICY "Allow admins to update sort_options"
    ON sort_options
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policy to allow only admins to insert sort_options
CREATE POLICY "Allow admins to insert sort_options"
    ON sort_options
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policy to allow only admins to delete sort_options
CREATE POLICY "Allow admins to delete sort_options"
    ON sort_options
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_sort_options_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
DROP TRIGGER IF EXISTS sort_options_updated_at_trigger ON sort_options;
CREATE TRIGGER sort_options_updated_at_trigger
    BEFORE UPDATE ON sort_options
    FOR EACH ROW
    EXECUTE FUNCTION update_sort_options_updated_at();

-- Function to ensure only one default sort option exists
CREATE OR REPLACE FUNCTION ensure_single_default_sort_option()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE sort_options
        SET is_default = false
        WHERE id != NEW.id AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one default
DROP TRIGGER IF EXISTS sort_options_single_default_trigger ON sort_options;
CREATE TRIGGER sort_options_single_default_trigger
    BEFORE INSERT OR UPDATE ON sort_options
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION ensure_single_default_sort_option();

-- Insert default sort options
DO $$
BEGIN
    -- Only insert if table is empty
    IF NOT EXISTS (SELECT 1 FROM sort_options) THEN
        INSERT INTO sort_options (code, label_hr, label_en, field, direction, is_default, is_enabled, display_order) VALUES
        ('featured', 'Istaknuto', 'Featured', 'featured', 'desc', true, true, 0),
        ('newest', 'Najnovije', 'Newest Arrivals', 'created_at', 'desc', false, true, 1),
        ('name-asc', 'Naziv A-Ž', 'Name A-Z', 'name', 'asc', false, true, 2),
        ('name-desc', 'Naziv Ž-A', 'Name Z-A', 'name', 'desc', false, true, 3),
        ('price-low', 'Cijena: od najniže', 'Price: Low to High', 'price', 'asc', false, true, 4),
        ('price-high', 'Cijena: od najviše', 'Price: High to Low', 'price', 'desc', false, true, 5),
        ('manufacturer-asc', 'Proizvođač A-Ž', 'Manufacturer A-Z', 'brand', 'asc', false, false, 6),
        ('manufacturer-desc', 'Proizvođač Ž-A', 'Manufacturer Z-A', 'brand', 'desc', false, false, 7);

        RAISE NOTICE 'Created default sort options';
    END IF;
END $$;

-- Add helpful comments
COMMENT ON TABLE sort_options IS 'Product sorting options configuration for the solar shop';
COMMENT ON COLUMN sort_options.code IS 'Unique identifier code for the sort option (e.g., price-low, name-asc)';
COMMENT ON COLUMN sort_options.label_hr IS 'Croatian label displayed in the UI';
COMMENT ON COLUMN sort_options.label_en IS 'English label displayed in the UI';
COMMENT ON COLUMN sort_options.field IS 'Database field to sort by (e.g., price, name, created_at)';
COMMENT ON COLUMN sort_options.direction IS 'Sort direction: asc or desc';
COMMENT ON COLUMN sort_options.is_default IS 'Whether this is the default sort option';
COMMENT ON COLUMN sort_options.is_enabled IS 'Whether this sort option is visible to users';
COMMENT ON COLUMN sort_options.display_order IS 'Order in which sort options appear in the dropdown';

COMMENT ON POLICY "Allow all users to read sort_options" ON sort_options IS
    'All users including anonymous can read sort options for product filtering';
COMMENT ON POLICY "Allow admins to update sort_options" ON sort_options IS
    'Only users with role=admin in profiles table can update sort options';
COMMENT ON POLICY "Allow admins to insert sort_options" ON sort_options IS
    'Only users with role=admin in profiles table can insert sort options';
COMMENT ON POLICY "Allow admins to delete sort_options" ON sort_options IS
    'Only users with role=admin in profiles table can delete sort options';
