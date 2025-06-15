-- =====================================================
-- CREATE COMPANY PRICING TABLE
-- File: 007_create_company_pricing.sql
-- Description: Stores custom product prices per company
-- =====================================================

-- Create table
CREATE TABLE IF NOT EXISTS public.company_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, product_id)
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_company_pricing_updated_at ON public.company_pricing;
CREATE TRIGGER update_company_pricing_updated_at
    BEFORE UPDATE ON public.company_pricing
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.company_pricing ENABLE ROW LEVEL SECURITY;

-- Company admins manage their pricing
CREATE POLICY "Company admins manage their pricing" ON public.company_pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = company_id
            AND p.user_id = auth.uid()
            AND p.role = 'company_admin'
        )
    );

-- Admins manage all pricing
CREATE POLICY "Admins manage company pricing" ON public.company_pricing
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid()
            AND p.role = 'admin'
        )
    );

COMMIT;
