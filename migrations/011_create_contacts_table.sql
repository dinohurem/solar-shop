-- Migration: Create contacts table
-- This migration creates the contacts table for storing contact form submissions and newsletter signups

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT,
    message TEXT,
    is_newsletter BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_newsletter ON public.contacts(is_newsletter);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION public.update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contacts_updated_at();

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Admins can manage contacts" ON public.contacts;

-- Allow anonymous and authenticated users to insert contacts
CREATE POLICY "Anyone can insert contacts" ON public.contacts
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Admins can manage contacts
CREATE POLICY "Admins can manage contacts" ON public.contacts
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'company_admin')
        )
    ) WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'company_admin')
        )
    );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.contacts TO anon, authenticated;
GRANT SELECT, INSERT ON public.contacts TO anon;

-- Comments
COMMENT ON TABLE public.contacts IS 'Contact form submissions and newsletter signups';
COMMENT ON COLUMN public.contacts.is_newsletter IS 'True if record was created from newsletter signup';

COMMIT;
