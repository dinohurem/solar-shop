-- =====================================================
-- FIX COMPANY PRICING FOREIGN KEY
-- File: 012_fix_company_pricing_foreign_key.sql
-- Description: Update company_pricing table to reference companies table instead of profiles table
-- =====================================================

-- First, drop the existing foreign key constraint
ALTER TABLE public.company_pricing 
DROP CONSTRAINT IF EXISTS company_pricing_company_id_fkey;

-- Update the foreign key to reference companies table
ALTER TABLE public.company_pricing 
ADD CONSTRAINT company_pricing_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update RLS policies to work with companies table
DROP POLICY IF EXISTS "Company admins manage their pricing" ON public.company_pricing;
DROP POLICY IF EXISTS "Admins manage company pricing" ON public.company_pricing;

-- Company owners can manage their company's pricing
CREATE POLICY "Company owners manage their pricing" ON public.company_pricing
    FOR ALL USING (
        company_id IN (
            SELECT id FROM public.companies c
            WHERE c.contact_person_id = auth.uid()
            AND c.status = 'approved'
        )
    );

-- Admins can manage all company pricing
CREATE POLICY "Admins manage all company pricing" ON public.company_pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
            AND p.role = 'admin'
        )
    );

COMMIT; 