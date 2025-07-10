-- Migration: Create wishlist table
-- This migration creates the wishlist table for storing user product wishlists

-- Create the wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure a user can only add a product to wishlist once
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist(created_at);

-- Create the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for updating updated_at column
DROP TRIGGER IF EXISTS update_wishlist_updated_at ON public.wishlist;
CREATE TRIGGER update_wishlist_updated_at
    BEFORE UPDATE ON public.wishlist
    FOR EACH ROW
    EXECUTE FUNCTION public.update_wishlist_updated_at();

-- Enable Row Level Security
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own wishlist items
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Users can only add items to their own wishlist
CREATE POLICY "Users can insert to their own wishlist" ON public.wishlist
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Users can only remove items from their own wishlist
CREATE POLICY "Users can delete from their own wishlist" ON public.wishlist
    FOR DELETE USING (
        user_id IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Admins can view all wishlist items
CREATE POLICY "Admins can view all wishlists" ON public.wishlist
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'company_admin')
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.wishlist TO authenticated;
GRANT SELECT ON public.wishlist TO anon;

-- Add helpful comments
COMMENT ON TABLE public.wishlist IS 'User wishlist items linking users to products they want to save for later';
COMMENT ON COLUMN public.wishlist.user_id IS 'Reference to the user who added this item to wishlist';
COMMENT ON COLUMN public.wishlist.product_id IS 'Reference to the product in the wishlist';

COMMIT; 