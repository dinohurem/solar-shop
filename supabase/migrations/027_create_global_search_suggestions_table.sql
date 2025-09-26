-- Migration: Create global search suggestions table
-- This migration creates the global_search_suggestions table for storing search suggestions across all users

CREATE TABLE IF NOT EXISTS public.global_search_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('search', 'filter', 'category')),
    value TEXT NOT NULL,
    display_text TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_global_search_suggestions_type_value ON public.global_search_suggestions(type, lower(value));
CREATE INDEX IF NOT EXISTS idx_global_search_suggestions_count ON public.global_search_suggestions(count DESC);
CREATE INDEX IF NOT EXISTS idx_global_search_suggestions_updated_at ON public.global_search_suggestions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_global_search_suggestions_type ON public.global_search_suggestions(type);

-- Trigger to update updated_at column
CREATE OR REPLACE FUNCTION public.update_global_search_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_global_search_suggestions_updated_at ON public.global_search_suggestions;
CREATE TRIGGER update_global_search_suggestions_updated_at
    BEFORE UPDATE ON public.global_search_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_global_search_suggestions_updated_at();

-- Enable Row Level Security
ALTER TABLE public.global_search_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read global search suggestions" ON public.global_search_suggestions;
DROP POLICY IF EXISTS "Authenticated users can manage global search suggestions" ON public.global_search_suggestions;

-- Allow anyone to read global search suggestions
CREATE POLICY "Anyone can read global search suggestions" ON public.global_search_suggestions
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow authenticated users to insert and update global search suggestions
CREATE POLICY "Authenticated users can manage global search suggestions" ON public.global_search_suggestions
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update global search suggestions" ON public.global_search_suggestions
    FOR UPDATE TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.global_search_suggestions TO anon, authenticated;
GRANT INSERT, UPDATE ON public.global_search_suggestions TO authenticated;

-- Comments
COMMENT ON TABLE public.global_search_suggestions IS 'Global search suggestions aggregated across all users';
COMMENT ON COLUMN public.global_search_suggestions.type IS 'Type of suggestion: search, filter, or category';
COMMENT ON COLUMN public.global_search_suggestions.value IS 'The actual search value (normalized to lowercase)';
COMMENT ON COLUMN public.global_search_suggestions.display_text IS 'Human-readable display text for the suggestion';
COMMENT ON COLUMN public.global_search_suggestions.count IS 'Number of times this suggestion has been used';

COMMIT;