-- Add ordering_enabled column to settings table
-- Migration: 036_add_ordering_enabled_to_settings.sql
-- Description: Adds a flag to enable/disable ordering for B2B and B2C customers

-- Add the ordering_enabled column
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS ordering_enabled BOOLEAN NOT NULL DEFAULT true;

-- Add helpful comment
COMMENT ON COLUMN settings.ordering_enabled IS 'Toggle to enable/disable ordering for all customers (B2B and B2C)';

-- Update existing settings record to have ordering enabled by default
UPDATE settings SET ordering_enabled = true WHERE ordering_enabled IS NULL;
