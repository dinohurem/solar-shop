-- Migration: Fix reviews admin policies to use profiles table instead of service role
-- Date: 2024-12-02

-- Drop the problematic policies that try to access auth.users table or use service role
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
DROP POLICY IF EXISTS "Service role can manage all reviews" ON reviews;

-- Create corrected policies using profiles table for role checking

-- SELECT policies for admins
CREATE POLICY "Admins can view all reviews" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- UPDATE policies for admins
CREATE POLICY "Admins can update all reviews" ON reviews
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- DELETE policies for admins
CREATE POLICY "Admins can delete all reviews" ON reviews
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Keep existing user policies
-- Users can view approved reviews
-- Users can view their own reviews
-- Users can create reviews for their purchases
-- Users can update their own reviews

-- Add helpful comments
COMMENT ON POLICY "Admins can view all reviews" ON reviews IS 'Allow admin users to view all reviews using profiles table role check';
COMMENT ON POLICY "Admins can update all reviews" ON reviews IS 'Allow admin users to update all reviews using profiles table role check';
COMMENT ON POLICY "Admins can delete all reviews" ON reviews IS 'Allow admin users to delete all reviews using profiles table role check';

COMMIT; 