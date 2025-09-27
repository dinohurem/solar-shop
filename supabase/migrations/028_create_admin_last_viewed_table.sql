-- Migration: Create admin last viewed table
-- This migration creates the admin_last_viewed table for tracking when admins last viewed each section

CREATE TABLE IF NOT EXISTS public.admin_last_viewed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    section TEXT NOT NULL CHECK (section IN ('orders', 'partner_orders', 'contacts', 'users', 'companies', 'wishlists', 'reviews')),
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Ensure one record per admin per section
    UNIQUE(admin_id, section)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_last_viewed_admin_id ON public.admin_last_viewed(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_last_viewed_section ON public.admin_last_viewed(section);
CREATE INDEX IF NOT EXISTS idx_admin_last_viewed_composite ON public.admin_last_viewed(admin_id, section);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION public.update_admin_last_viewed_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_last_viewed_updated_at ON public.admin_last_viewed;
CREATE TRIGGER update_admin_last_viewed_updated_at
    BEFORE UPDATE ON public.admin_last_viewed
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_last_viewed_updated_at();

-- Enable Row Level Security
ALTER TABLE public.admin_last_viewed ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage their own last viewed data" ON public.admin_last_viewed;

-- Allow admins to manage their own last viewed data
CREATE POLICY "Admins can manage their own last viewed data" ON public.admin_last_viewed
    FOR ALL TO authenticated
    USING (auth.uid() = admin_id)
    WITH CHECK (auth.uid() = admin_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_last_viewed TO authenticated;

-- Comments
COMMENT ON TABLE public.admin_last_viewed IS 'Tracks when admins last viewed each section to calculate notification counts';
COMMENT ON COLUMN public.admin_last_viewed.section IS 'Section name: orders, partner_orders, contacts, users, companies, wishlists, reviews';
COMMENT ON COLUMN public.admin_last_viewed.last_viewed_at IS 'When the admin last viewed this section';

COMMIT;