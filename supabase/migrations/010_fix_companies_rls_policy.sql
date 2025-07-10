-- Migration: Fix companies table RLS policy for public partner registration
-- This migration allows public registration while maintaining security for other operations

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own company" ON public.companies;

-- Create a policy that allows public registration (anyone can insert a company)
-- This is needed for the partner registration form that allows strangers to register
CREATE POLICY "Public can register companies" ON public.companies
    FOR INSERT WITH CHECK (true);

-- Keep the SELECT policy for authenticated users to view their own company
DROP POLICY IF EXISTS "Company owners can view their own company" ON public.companies;

CREATE POLICY "Company owners can view their own company" ON public.companies
    FOR SELECT USING (
        contact_person_id = auth.uid()
    );

-- Keep the UPDATE policy for authenticated users to update their own pending company
DROP POLICY IF EXISTS "Company owners can update their own pending company" ON public.companies;

CREATE POLICY "Company owners can update their own pending company" ON public.companies
    FOR UPDATE USING (
        contact_person_id = auth.uid()
        AND status = 'pending'
    );

-- Ensure anon users can also insert (for public registration)
GRANT INSERT ON public.companies TO anon;

-- Add a comment explaining the public registration policy
COMMENT ON POLICY "Public can register companies" ON public.companies IS 'Allows public registration for B2B partner applications';

COMMIT; 