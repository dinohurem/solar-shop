-- Create settings table for application-wide settings
-- Migration: 031_create_settings_table.sql
-- Description: Creates settings table with correct RLS policies and ensures single record
-- This migration is idempotent and can be run multiple times safely

-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_card_payment_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to ensure clean state)
DROP POLICY IF EXISTS "Allow all authenticated users to read settings" ON settings;
DROP POLICY IF EXISTS "Allow admins to update settings" ON settings;
DROP POLICY IF EXISTS "Allow admins to insert settings" ON settings;
DROP POLICY IF EXISTS "Allow admins to delete settings" ON settings;

-- Create policy to allow all authenticated users to read settings
CREATE POLICY "Allow all authenticated users to read settings"
    ON settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow only admins to update settings
-- IMPORTANT: Uses profiles.user_id (foreign key to auth.users) not profiles.id
CREATE POLICY "Allow admins to update settings"
    ON settings
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

-- Create policy to allow only admins to insert settings
-- IMPORTANT: Uses profiles.user_id (foreign key to auth.users) not profiles.id
CREATE POLICY "Allow admins to insert settings"
    ON settings
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

-- Create policy to allow only admins to delete settings
-- IMPORTANT: Uses profiles.user_id (foreign key to auth.users) not profiles.id
CREATE POLICY "Allow admins to delete settings"
    ON settings
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
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
DROP TRIGGER IF EXISTS settings_updated_at_trigger ON settings;
CREATE TRIGGER settings_updated_at_trigger
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Ensure there is exactly one settings record
DO $$
BEGIN
    -- If no settings exist, create default
    IF NOT EXISTS (SELECT 1 FROM settings) THEN
        INSERT INTO settings (credit_card_payment_enabled)
        VALUES (true);
        RAISE NOTICE 'Created default settings record';
    END IF;

    -- If multiple settings exist, keep only the most recent one
    IF (SELECT COUNT(*) FROM settings) > 1 THEN
        DELETE FROM settings
        WHERE id NOT IN (
            SELECT id FROM settings ORDER BY created_at DESC LIMIT 1
        );
        RAISE NOTICE 'Cleaned up duplicate settings records';
    END IF;
END $$;

-- Add helpful comments
COMMENT ON TABLE settings IS 'Application-wide settings for the solar shop';
COMMENT ON COLUMN settings.credit_card_payment_enabled IS 'Toggle to enable/disable credit card payment option in B2C checkout';

COMMENT ON POLICY "Allow all authenticated users to read settings" ON settings IS
    'All authenticated users can read settings to check if credit card payment is enabled';
COMMENT ON POLICY "Allow admins to update settings" ON settings IS
    'Only users with role=admin in profiles table can update settings. Uses profiles.user_id for lookup.';
COMMENT ON POLICY "Allow admins to insert settings" ON settings IS
    'Only users with role=admin in profiles table can insert settings. Uses profiles.user_id for lookup.';
COMMENT ON POLICY "Allow admins to delete settings" ON settings IS
    'Only users with role=admin in profiles table can delete settings. Uses profiles.user_id for lookup.';
