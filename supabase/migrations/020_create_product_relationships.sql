-- Create product relationships table for suggested/related products
-- This allows products to be connected to other products or categories

-- Create the product_relationships table
CREATE TABLE product_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  related_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL DEFAULT 'suggested',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure either related_product_id or related_category_id is set, but not both
  CONSTRAINT check_relationship_target CHECK (
    (related_product_id IS NOT NULL AND related_category_id IS NULL) OR
    (related_product_id IS NULL AND related_category_id IS NOT NULL)
  ),
  
  -- Ensure a product cannot be related to itself
  CONSTRAINT check_no_self_reference CHECK (
    product_id != related_product_id OR related_product_id IS NULL
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_product_relationships_product ON product_relationships(product_id) WHERE is_active = true;
CREATE INDEX idx_product_relationships_related_product ON product_relationships(related_product_id) WHERE is_active = true;
CREATE INDEX idx_product_relationships_related_category ON product_relationships(related_category_id) WHERE is_active = true;
CREATE INDEX idx_product_relationships_type ON product_relationships(relationship_type);

-- Create unique constraint to prevent duplicate relationships
CREATE UNIQUE INDEX idx_unique_product_relationships ON product_relationships(
  product_id, 
  COALESCE(related_product_id, '00000000-0000-0000-0000-000000000000'::uuid),
  COALESCE(related_category_id, '00000000-0000-0000-0000-000000000000'::uuid),
  relationship_type
) WHERE is_active = true;

-- Enable RLS
ALTER TABLE product_relationships ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read active relationships
CREATE POLICY "Users can view active product relationships" ON product_relationships
  FOR SELECT
  USING (is_active = true);

-- Policy for admins to manage relationships
CREATE POLICY "Admins can manage product relationships" ON product_relationships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add trigger to update the updated_at timestamp
CREATE TRIGGER update_product_relationships_updated_at
  BEFORE UPDATE ON product_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE product_relationships IS 'Stores relationships between products and other products or categories for suggested items';
COMMENT ON COLUMN product_relationships.relationship_type IS 'Type of relationship: suggested, complementary, alternative, etc.';
COMMENT ON COLUMN product_relationships.sort_order IS 'Order in which related items should be displayed';