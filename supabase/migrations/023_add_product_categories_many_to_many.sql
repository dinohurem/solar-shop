-- Create product_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure unique product-category combinations
    UNIQUE(product_id, category_id)
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_primary ON product_categories(product_id, is_primary) WHERE is_primary = true;

-- Migrate existing category_id data to the new junction table
INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT id, category_id, true
FROM products 
WHERE category_id IS NOT NULL;

-- RLS Policies for product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "product_categories_select_policy" ON product_categories
    FOR SELECT USING (true);

-- Allow admin users to insert, update, and delete
CREATE POLICY "product_categories_insert_policy" ON product_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "product_categories_update_policy" ON product_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "product_categories_delete_policy" ON product_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add a trigger to ensure only one primary category per product
CREATE OR REPLACE FUNCTION ensure_single_primary_category()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting is_primary to true, unset all other primary categories for this product
    IF NEW.is_primary = true THEN
        UPDATE product_categories 
        SET is_primary = false 
        WHERE product_id = NEW.product_id 
        AND category_id != NEW.category_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_primary_category
    BEFORE INSERT OR UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_category();