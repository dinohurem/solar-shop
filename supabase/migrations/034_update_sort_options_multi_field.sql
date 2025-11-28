-- Update sort_options table to support multi-field sorting
-- Migration: 034_update_sort_options_multi_field.sql
-- Description: Adds sort_fields JSONB column to store array of {field, direction} objects

-- Add sort_fields column as JSONB array
ALTER TABLE sort_options
ADD COLUMN IF NOT EXISTS sort_fields JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single field/direction data to new sort_fields array format
UPDATE sort_options
SET sort_fields = jsonb_build_array(
    jsonb_build_object('field', field, 'direction', direction)
)
WHERE sort_fields = '[]'::jsonb OR sort_fields IS NULL;

-- Update 'featured' sort option to have multiple fields (is_featured DESC, created_at DESC)
UPDATE sort_options
SET sort_fields = '[{"field": "is_featured", "direction": "desc"}, {"field": "created_at", "direction": "desc"}]'::jsonb
WHERE code = 'featured';

-- Add helpful comment
COMMENT ON COLUMN sort_options.sort_fields IS 'Array of sort field definitions: [{field: string, direction: asc|desc}]';
