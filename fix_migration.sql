-- Fix company_pricing foreign key constraint
-- Run this in your Supabase SQL Editor

-- First, drop the existing foreign key constraint
ALTER TABLE public.company_pricing 
DROP CONSTRAINT IF EXISTS company_pricing_company_id_fkey;

-- Add the new foreign key constraint referencing companies table
ALTER TABLE public.company_pricing 
ADD CONSTRAINT company_pricing_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Update RLS policies for companies table
DROP POLICY IF EXISTS "Enable read access for admin users" ON public.companies;
DROP POLICY IF EXISTS "Enable insert for admin users" ON public.companies;
DROP POLICY IF EXISTS "Enable update for admin users" ON public.companies;
DROP POLICY IF EXISTS "Enable delete for admin users" ON public.companies;

CREATE POLICY "Enable read access for admin users" 
ON public.companies FOR SELECT 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable insert for admin users" 
ON public.companies FOR INSERT 
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable update for admin users" 
ON public.companies FOR UPDATE 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable delete for admin users" 
ON public.companies FOR DELETE 
USING (auth.jwt() ->> 'role' = 'admin');

-- Enable RLS on companies table if not already enabled
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY; 