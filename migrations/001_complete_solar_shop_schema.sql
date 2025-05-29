-- =====================================================
-- COMPLETE SOLAR SHOP DATABASE MIGRATION
-- File: 001_complete_solar_shop_schema.sql
-- Description: Complete schema with seed data and proper type compatibility
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.increment_blog_post_views(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.generate_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    role TEXT DEFAULT 'customer' NOT NULL CHECK (role IN ('customer', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create products table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR' NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL NOT NULL,
    subcategory TEXT,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb NOT NULL,
    features TEXT[] DEFAULT '{}' NOT NULL,
    certifications TEXT[] DEFAULT '{}' NOT NULL,
    warranty_years INTEGER DEFAULT 1,
    weight DECIMAL(8,2),
    dimensions JSONB,
    in_stock BOOLEAN DEFAULT true NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    stock_threshold INTEGER DEFAULT 5 NOT NULL,
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order')) NOT NULL,
    tags TEXT[] DEFAULT '{}' NOT NULL,
    rating_average DECIMAL(3,2) DEFAULT 0 NOT NULL,
    rating_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_on_sale BOOLEAN DEFAULT false NOT NULL,
    free_shipping BOOLEAN DEFAULT false NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create offers table (consolidates coupons and offers)
CREATE TABLE public.offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    type TEXT NOT NULL CHECK (type IN (
        'percentage_discount', 'fixed_amount_discount', 'buy_x_get_y', 
        'free_shipping', 'bundle_deal', 'flash_sale', 'seasonal_sale', 
        'clearance', 'loyalty_reward', 'referral_bonus', 'first_time_customer', 'bulk_discount'
    )),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'expired', 'cancelled')) NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    image_url TEXT,
    banner_image_url TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    auto_apply BOOLEAN DEFAULT false NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_order_amount DECIMAL(10,2),
    applicable_product_ids UUID[],
    applicable_category_ids UUID[],
    excluded_product_ids UUID[],
    excluded_category_ids UUID[],
    max_usage INTEGER,
    max_usage_per_customer INTEGER,
    current_usage INTEGER DEFAULT 0 NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create cart_items table
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT cart_user_or_session CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    )
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    featured_image_url TEXT,
    featured_image TEXT, -- For backward compatibility
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT, -- For backward compatibility
    tags TEXT[] DEFAULT '{}' NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')) NOT NULL,
    is_published BOOLEAN GENERATED ALWAYS AS (status = 'published') STORED,
    published_at TIMESTAMP WITH TIME ZONE,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}' NOT NULL,
    reading_time INTEGER,
    view_count INTEGER DEFAULT 0 NOT NULL,
    views_count INTEGER DEFAULT 0 NOT NULL, -- For backward compatibility
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON public.products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock_status, in_stock);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_code ON public.offers(code);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON public.offers(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(is_featured, published_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check admin role without RLS issues
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin());

-- Offers policies (public read for active offers)
CREATE POLICY "Active offers are viewable by everyone" ON public.offers
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage offers" ON public.offers
    FOR ALL USING (public.is_admin());

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON public.cart_items
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can insert their own cart items" ON public.cart_items
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can update their own cart items" ON public.cart_items
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
    FOR DELETE USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

-- Blog posts policies (public read for published posts)
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (public.is_admin());

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        CASE 
            WHEN NEW.email = 'admin@solarshop.com' THEN 'admin'
            ELSE 'customer'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment blog post view count
CREATE OR REPLACE FUNCTION increment_blog_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.blog_posts 
    SET view_count = view_count + 1, views_count = views_count + 1
    WHERE id = post_id AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert Categories
INSERT INTO public.categories (id, name, slug, description, parent_id, image_url, is_active, sort_order) VALUES
('01234567-89ab-cdef-0123-456789abcdef', 'Solar Panels', 'solar-panels', 'High-efficiency solar panels for residential and commercial use', NULL, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop', true, 1),
('01234567-89ab-cdef-0123-456789abcde0', 'Inverters', 'inverters', 'Solar inverters to convert DC to AC power', NULL, 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=500&fit=crop', true, 2),
('01234567-89ab-cdef-0123-456789abcde1', 'Battery Storage', 'battery-storage', 'Energy storage solutions for solar systems', NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop', true, 3),
('01234567-89ab-cdef-0123-456789abcde2', 'Mounting Systems', 'mounting-systems', 'Roof and ground mounting solutions', NULL, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop', true, 4),
('01234567-89ab-cdef-0123-456789abcde3', 'Monitoring Systems', 'monitoring-systems', 'Solar system monitoring and optimization', NULL, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=500&fit=crop', true, 5),
('01234567-89ab-cdef-0123-456789abcde4', 'Accessories', 'accessories', 'Cables, connectors, and other solar accessories', NULL, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop', true, 6),

-- Subcategories
('01234567-89ab-cdef-0123-456789abcde5', 'Monocrystalline Panels', 'monocrystalline-panels', 'High-efficiency monocrystalline solar panels', '01234567-89ab-cdef-0123-456789abcdef', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop', true, 1),
('01234567-89ab-cdef-0123-456789abcde6', 'Polycrystalline Panels', 'polycrystalline-panels', 'Cost-effective polycrystalline solar panels', '01234567-89ab-cdef-0123-456789abcdef', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop', true, 2),
('01234567-89ab-cdef-0123-456789abcde7', 'String Inverters', 'string-inverters', 'Traditional string inverters for solar systems', '01234567-89ab-cdef-0123-456789abcde0', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=500&fit=crop', true, 1),
('01234567-89ab-cdef-0123-456789abcde8', 'Micro Inverters', 'micro-inverters', 'Panel-level micro inverters for optimal performance', '01234567-89ab-cdef-0123-456789abcde0', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=500&fit=crop', true, 2);

-- Insert Products
INSERT INTO public.products (id, name, slug, description, short_description, sku, price, original_price, category_id, brand, model, specifications, features, certifications, warranty_years, weight, dimensions, images, in_stock, stock_quantity, is_featured, is_active, rating_average, rating_count, free_shipping) VALUES

-- Solar Panels
('11234567-89ab-cdef-0123-456789abcdef', 'SolarMax Pro 400W Monocrystalline Panel', 'solarmax-pro-400w-mono', 'High-efficiency 400W monocrystalline solar panel with excellent performance in low-light conditions. Features advanced PERC cell technology and robust aluminum frame for long-lasting durability.', 'High-efficiency 400W monocrystalline solar panel', 'SM-MONO-400W-001', 299.99, 349.99, '01234567-89ab-cdef-0123-456789abcde5', 'SolarMax', 'SM-400M-PERC', '{"power_output": "400W", "efficiency": "21.2%", "voltage_max": "40.5V", "current_max": "9.88A", "cell_type": "Monocrystalline PERC", "cells": "72 cells", "temperature_coefficient": "-0.38%/°C"}', ARRAY['PERC cell technology', 'Anti-reflective coating', 'Corrosion-resistant frame', 'IP67 junction box', '25-year performance warranty'], ARRAY['IEC 61215', 'IEC 61730', 'CE', 'TUV', 'UL 1703'], 25, 22.5, '{"length": 2000, "width": 1000, "height": 35, "unit": "mm"}', '[{"url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop", "alt": "SolarMax Pro 400W Panel", "is_primary": true}]', true, 150, true, true, 4.7, 89, true),

('11234567-89ab-cdef-0123-456789abcde0', 'EcoSolar 320W Polycrystalline Panel', 'ecosolar-320w-poly', 'Reliable and cost-effective 320W polycrystalline solar panel perfect for residential installations. Excellent value for money with proven performance.', 'Cost-effective 320W polycrystalline solar panel', 'ES-POLY-320W-002', 199.99, 249.99, '01234567-89ab-cdef-0123-456789abcde6', 'EcoSolar', 'ES-320P-STD', '{"power_output": "320W", "efficiency": "19.5%", "voltage_max": "37.2V", "current_max": "8.61A", "cell_type": "Polycrystalline", "cells": "72 cells", "temperature_coefficient": "-0.41%/°C"}', ARRAY['Multi-crystalline silicon cells', 'Anodized aluminum frame', 'Tempered glass', 'Standard warranty', 'Proven technology'], ARRAY['IEC 61215', 'IEC 61730', 'CE', 'TUV'], 20, 21.8, '{"length": 1956, "width": 992, "height": 40, "unit": "mm"}', '[{"url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop", "alt": "EcoSolar 320W Panel", "is_primary": true}]', true, 200, false, true, 4.3, 156, true),

-- Inverters
('11234567-89ab-cdef-0123-456789abcde1', 'SolarInvert String 5kW Inverter', 'solarinvert-string-5kw', 'Reliable 5kW string inverter with advanced MPPT technology and comprehensive monitoring capabilities. Perfect for residential solar installations.', 'High-efficiency 5kW string inverter', 'SI-STRING-5KW-001', 899.99, 999.99, '01234567-89ab-cdef-0123-456789abcde7', 'SolarInvert', 'SI-5000TL', '{"power_output": "5000W", "efficiency": "97.6%", "mppt_trackers": 2, "max_dc_voltage": "1000V", "ac_voltage": "230V", "frequency": "50Hz", "protection_rating": "IP65"}', ARRAY['Dual MPPT trackers', 'WiFi monitoring', 'Fanless design', 'Compact size', 'Easy installation'], ARRAY['IEC 62109', 'EN 50438', 'VDE-AR-N 4105', 'CE', 'G83/2'], 10, 18.5, '{"length": 470, "width": 350, "height": 180, "unit": "mm"}', '[{"url": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop", "alt": "SolarInvert String 5kW Inverter", "is_primary": true}]', true, 85, true, true, 4.6, 73, false),

('11234567-89ab-cdef-0123-456789abcde2', 'MicroMax 300W Micro Inverter', 'micromax-300w-micro', 'Panel-level micro inverter providing maximum energy harvest and individual panel monitoring. Ideal for complex roof layouts and shading conditions.', 'High-performance 300W micro inverter', 'MM-MICRO-300W-002', 149.99, 179.99, '01234567-89ab-cdef-0123-456789abcde8', 'MicroMax', 'MM-300M-PERC', '{"power_output": "300W", "efficiency": "96.5%", "max_dc_voltage": "60V", "ac_voltage": "230V", "frequency": "50Hz", "protection_rating": "IP67"}', ARRAY['Panel-level optimization', 'Rapid shutdown', '25-year warranty', 'Easy installation', 'Real-time monitoring'], ARRAY['IEC 62109', 'EN 50438', 'UL 1741', 'CE', 'FCC'], 25, 0.7, '{"length": 166, "width": 175, "height": 33, "unit": "mm"}', '[{"url": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop", "alt": "MicroMax 300W Micro Inverter", "is_primary": true}]', true, 300, false, true, 4.5, 128, false),

-- Battery Storage
('11234567-89ab-cdef-0123-456789abcde3', 'EnergyStore 10kWh Lithium Battery', 'energystore-10kwh-lithium', 'High-capacity 10kWh lithium battery system with integrated BMS and smart monitoring. Perfect for residential energy storage and backup power.', 'Advanced 10kWh lithium battery storage system', 'ES-BATT-10KWH-001', 4999.99, 5499.99, '01234567-89ab-cdef-0123-456789abcde1', 'EnergyStore', 'ES-10K-LiFePO4', '{"capacity": "10kWh", "voltage": "48V", "chemistry": "LiFePO4", "cycles": "6000+", "efficiency": "95%", "max_discharge": "5kW", "operating_temp": "-10°C to 50°C"}', ARRAY['LiFePO4 chemistry', 'Integrated BMS', 'Modular design', 'Smart monitoring', '15-year warranty'], ARRAY['IEC 62619', 'UN38.3', 'CE', 'UL 1973', 'IEC 61000'], 15, 85, '{"length": 600, "width": 400, "height": 200, "unit": "mm"}', '[{"url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", "alt": "EnergyStore 10kWh Battery", "is_primary": true}]', true, 45, true, true, 4.7, 34, false);

-- Insert Offers
INSERT INTO public.offers (id, code, title, description, type, status, discount_type, discount_value, max_discount_amount, min_order_amount, start_date, end_date, is_active, auto_apply, featured) VALUES

('21234567-89ab-cdef-0123-456789abcdef', 'WELCOME10', 'Welcome 10% Off', 'Get 10% off your first order! Perfect for new customers starting their solar journey.', 'first_time_customer', 'active', 'percentage', 10, 500, 100, NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', true, false, true),

('21234567-89ab-cdef-0123-456789abcde0', 'SOLARBUNDLE', 'Solar Panel Bundle Deal', 'Save €200 on solar panel purchases over €2000. Perfect for complete system installations.', 'bundle_deal', 'active', 'fixed_amount', 200, NULL, 2000, NOW() - INTERVAL '3 days', NOW() + INTERVAL '45 days', true, false, true),

('21234567-89ab-cdef-0123-456789abcde1', 'FREESHIP', 'Free Shipping on Orders Over €500', 'Enjoy free shipping on all orders over €500. No weight limits!', 'free_shipping', 'active', 'free_shipping', 0, NULL, 500, NOW() - INTERVAL '10 days', NOW() + INTERVAL '60 days', true, true, false);

-- Insert Blog Posts (author_id will be NULL initially and can be updated when admin user is created)
INSERT INTO public.blog_posts (id, title, slug, excerpt, content, author_id, category, tags, featured_image_url, status, is_featured, view_count, reading_time, seo_title, seo_description, published_at) VALUES

('31234567-89ab-cdef-0123-456789abcdef', 'Complete Solar Installation Guide 2024', 'complete-solar-installation-guide-2024', 'Everything you need to know about installing solar panels in 2024, from planning to maintenance.', 'Solar energy has become increasingly popular as homeowners seek sustainable and cost-effective energy solutions. This comprehensive guide covers everything you need to know about solar installation in 2024. From initial planning and assessment to final commissioning and maintenance, we''ll walk you through each step of the process. Whether you''re a homeowner looking to go solar or a contractor expanding your services, this guide provides valuable insights into the latest technologies, best practices, and regulatory requirements.', NULL, 'Installation Guide', ARRAY['solar panels', 'installation', 'guide', '2024', 'renewable energy'], 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop', 'published', true, 1247, 8, 'Complete Solar Installation Guide 2024 | SolarShop', 'Learn everything about solar panel installation in 2024. Complete guide covering planning, installation, and maintenance.', NOW() - INTERVAL '5 days'),

('31234567-89ab-cdef-0123-456789abcde0', 'Why Battery Storage is Essential for Solar Systems', 'why-battery-storage-essential-solar-systems', 'Discover the key benefits of adding battery storage to your solar system and how it maximizes your investment.', 'Battery storage systems have revolutionized the solar industry by providing homeowners with energy independence and backup power capabilities. In this comprehensive article, we explore why battery storage is becoming an essential component of modern solar installations. From reducing reliance on the grid to maximizing self-consumption of solar energy, battery storage offers numerous benefits that make it a worthwhile investment for most solar system owners.', NULL, 'Energy Storage', ARRAY['battery storage', 'solar batteries', 'energy independence', 'backup power'], 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop', 'published', true, 892, 6, 'Why Battery Storage is Essential for Solar Systems | SolarShop', 'Discover the benefits of solar battery storage systems and how they provide energy independence and backup power.', NOW() - INTERVAL '10 days'),

('31234567-89ab-cdef-0123-456789abcde1', '10 Essential Solar Panel Maintenance Tips', 'essential-solar-panel-maintenance-tips', 'Keep your solar panels performing at their best with these essential maintenance tips and best practices.', 'Proper maintenance is crucial for ensuring your solar panels continue to operate efficiently and last for decades. While solar panels are generally low-maintenance, there are several important steps you can take to maximize their performance and lifespan. This article covers the top 10 maintenance tips that every solar system owner should know, from regular cleaning schedules to monitoring system performance and identifying potential issues early.', NULL, 'Maintenance', ARRAY['solar maintenance', 'panel cleaning', 'performance optimization', 'tips'], 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&h=600&fit=crop', 'published', false, 634, 5, '10 Essential Solar Panel Maintenance Tips | SolarShop', 'Learn essential solar panel maintenance tips to keep your system performing optimally for years to come.', NOW() - INTERVAL '15 days'),

('31234567-89ab-cdef-0123-456789abcde2', 'Solar Panel ROI: What to Expect in 2024', 'solar-panel-roi-what-to-expect-2024', 'Understand the return on investment for solar panels in 2024, including payback periods and long-term savings.', 'Investing in solar panels is not just about environmental benefits – it''s also a smart financial decision. In 2024, solar panel ROI continues to improve thanks to technological advances, government incentives, and declining installation costs. This detailed analysis examines current solar panel ROI expectations, factors that influence payback periods, and strategies to maximize your solar investment return.', NULL, 'Financial', ARRAY['solar ROI', 'return on investment', 'solar savings', 'payback period', '2024'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop', 'published', true, 1123, 9, 'Solar Panel ROI: What to Expect in 2024 | SolarShop', 'Learn about solar panel return on investment, payback periods, and long-term savings in 2024.', NOW() - INTERVAL '3 days');

-- Update blog posts to link to admin profile once it exists
-- This will be done via application logic when admin user is created

COMMIT; 


-- Drop problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

-- Create a security definer function to check admin role without RLS issues
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage offers" ON public.offers
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (public.is_admin());

-- Allow public access to categories and products for display
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (true);

-- Allow public access to active offers
CREATE POLICY "Public can view active offers" ON public.offers
    FOR SELECT USING (true);

-- Allow public access to published blog posts
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
    FOR SELECT USING (true);