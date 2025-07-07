-- Migration: Create offer_products table
-- This migration creates a junction table to connect offers with products
-- and store product-specific discount information

-- Create offer_products table
CREATE TABLE public.offer_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    original_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique combination of offer and product
    UNIQUE(offer_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX idx_offer_products_offer_id ON public.offer_products(offer_id);
CREATE INDEX idx_offer_products_product_id ON public.offer_products(product_id);
CREATE INDEX idx_offer_products_active ON public.offer_products(is_active);
CREATE INDEX idx_offer_products_sort_order ON public.offer_products(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_offer_products_updated_at 
    BEFORE UPDATE ON public.offer_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.offer_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for offer_products
-- Allow public read access for active offer products
CREATE POLICY "Offer products are viewable by everyone" ON public.offer_products
    FOR SELECT USING (true);

-- Allow admins to manage offer products
CREATE POLICY "Admins can manage offer products" ON public.offer_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Add comments for documentation
COMMENT ON TABLE public.offer_products IS 'Junction table connecting offers with products and storing product-specific discount information';
COMMENT ON COLUMN public.offer_products.offer_id IS 'Reference to the offer';
COMMENT ON COLUMN public.offer_products.product_id IS 'Reference to the product';
COMMENT ON COLUMN public.offer_products.discount_percentage IS 'Percentage discount applied to this product (0-100)';
COMMENT ON COLUMN public.offer_products.discount_amount IS 'Fixed amount discount applied to this product';
COMMENT ON COLUMN public.offer_products.original_price IS 'Original price of the product before discount';
COMMENT ON COLUMN public.offer_products.discounted_price IS 'Final price of the product after discount';
COMMENT ON COLUMN public.offer_products.is_active IS 'Whether this product is active in the offer';
COMMENT ON COLUMN public.offer_products.sort_order IS 'Order in which products appear in the offer';

-- Create a function to automatically calculate discounted price
CREATE OR REPLACE FUNCTION calculate_offer_product_price()
RETURNS TRIGGER AS $$
BEGIN
    -- Set original price from product if not provided
    IF NEW.original_price IS NULL THEN
        SELECT price INTO NEW.original_price 
        FROM public.products 
        WHERE id = NEW.product_id;
    END IF;
    
    -- Calculate discounted price based on discount type
    IF NEW.discount_percentage > 0 THEN
        NEW.discounted_price = NEW.original_price * (1 - NEW.discount_percentage / 100);
    ELSIF NEW.discount_amount > 0 THEN
        NEW.discounted_price = GREATEST(NEW.original_price - NEW.discount_amount, 0);
    ELSE
        NEW.discounted_price = NEW.original_price;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate discounted price
CREATE TRIGGER calculate_offer_product_price_trigger
    BEFORE INSERT OR UPDATE ON public.offer_products
    FOR EACH ROW EXECUTE FUNCTION calculate_offer_product_price(); 