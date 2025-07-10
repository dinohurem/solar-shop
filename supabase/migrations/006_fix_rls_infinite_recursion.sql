-- =====================================================
-- FIX RLS INFINITE RECURSION MIGRATION
-- File: 006_fix_rls_infinite_recursion.sql
-- Description: Fix infinite recursion in profiles table RLS policies
-- =====================================================

-- First, drop all existing policies that depend on the old is_admin function
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

-- Now we can safely drop the old function since no policies depend on it
DROP FUNCTION IF EXISTS public.is_admin();

-- Create a proper security definer function to check admin role without RLS
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Use a direct query without RLS to avoid infinite recursion
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE user_id = user_uuid 
        AND role IN ('admin', 'company_admin')
    );
END;
$$;

-- Create a function to check if user can access a specific profile
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Users can access their own profile or admins can access any profile
    RETURN (
        auth.uid() = profile_user_id OR 
        public.is_admin_user(auth.uid())
    );
END;
$$;

-- Grant execution permissions to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_access_profile(UUID) TO authenticated, anon;

-- Create new RLS policies for profiles using the security definer functions
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin_user());

-- Allow profile insertion (for user registration)
CREATE POLICY "System can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Recreate policies for other tables with the new function
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins can manage offers" ON public.offers
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (public.is_admin_user());

-- Add helpful comments
COMMENT ON FUNCTION public.is_admin_user(UUID) IS 'Check if user has admin privileges - SECURITY DEFINER to avoid RLS recursion';
COMMENT ON FUNCTION public.can_access_profile(UUID) IS 'Check if current user can access a specific profile';

COMMIT; 