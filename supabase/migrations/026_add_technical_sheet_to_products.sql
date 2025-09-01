-- Add technical_sheet column to products table
ALTER TABLE products ADD COLUMN technical_sheet TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN products.technical_sheet IS 'URL to the technical sheet/datasheet document for the product';