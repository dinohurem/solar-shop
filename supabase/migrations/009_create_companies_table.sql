-- Migration: Create companies table
-- This migration creates the companies table for storing B2B partner company information

-- Create the companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Personal Information (from user registration)
    contact_person_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    contact_person_name TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    address TEXT,
    
    -- Company Information
    company_name TEXT NOT NULL,
    tax_number TEXT NOT NULL UNIQUE,
    company_address TEXT NOT NULL,
    company_phone TEXT NOT NULL,
    company_email TEXT NOT NULL,
    website TEXT,
    
    -- Business Details
    business_type TEXT NOT NULL CHECK (business_type IN ('retailer', 'wholesaler', 'installer', 'distributor', 'other')),
    years_in_business INTEGER NOT NULL CHECK (years_in_business >= 0),
    annual_revenue DECIMAL(15,2),
    number_of_employees INTEGER CHECK (number_of_employees >= 0),
    description TEXT,
    
    -- Status and Approval
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.profiles(user_id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES public.profiles(user_id),
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_contact_person_id ON public.companies(contact_person_id);
CREATE INDEX IF NOT EXISTS idx_companies_tax_number ON public.companies(tax_number);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_business_type ON public.companies(business_type);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_company_email ON public.companies(company_email);

-- Create the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for updating updated_at column
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_companies_updated_at();

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Company owners can view their own company
CREATE POLICY "Company owners can view their own company" ON public.companies
    FOR SELECT USING (
        contact_person_id IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Company owners can update their own company (only if pending)
CREATE POLICY "Company owners can update their own pending company" ON public.companies
    FOR UPDATE USING (
        contact_person_id IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
        )
        AND status = 'pending'
    );

-- Users can insert their own company registration
CREATE POLICY "Users can insert their own company" ON public.companies
    FOR INSERT WITH CHECK (
        contact_person_id IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Admins can view all companies
CREATE POLICY "Admins can view all companies" ON public.companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'company_admin')
        )
    );

-- Admins can update any company
CREATE POLICY "Admins can update any company" ON public.companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'company_admin')
        )
    );

-- Admins can delete companies
CREATE POLICY "Admins can delete companies" ON public.companies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'company_admin')
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.companies TO authenticated;
GRANT SELECT ON public.companies TO anon;

-- Add helpful comments
COMMENT ON TABLE public.companies IS 'B2B partner company information and applications';
COMMENT ON COLUMN public.companies.contact_person_id IS 'Reference to the user who registered the company';
COMMENT ON COLUMN public.companies.tax_number IS 'Unique company tax identification number';
COMMENT ON COLUMN public.companies.status IS 'Application status: pending, approved, or rejected';
COMMENT ON COLUMN public.companies.business_type IS 'Type of business: retailer, wholesaler, installer, distributor, or other';

COMMIT; 