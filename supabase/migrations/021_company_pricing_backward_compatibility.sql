-- Temporary backward compatibility for company_pricing table
-- This ensures the 'price' column exists as an alias for systems still using it

-- Add price column as a copy of price_tier_1 if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'company_pricing' 
                 AND column_name = 'price') THEN
    ALTER TABLE company_pricing 
      ADD COLUMN price DECIMAL(10, 2);
    
    -- Copy existing price_tier_1 values to price column
    UPDATE company_pricing 
    SET price = price_tier_1 
    WHERE price IS NULL AND price_tier_1 IS NOT NULL;
  END IF;
END $$;

-- Create a trigger to keep price and price_tier_1 in sync
CREATE OR REPLACE FUNCTION sync_company_pricing_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- When price_tier_1 is updated, update price
  IF NEW.price_tier_1 IS NOT NULL AND (NEW.price IS NULL OR NEW.price != NEW.price_tier_1) THEN
    NEW.price := NEW.price_tier_1;
  END IF;
  
  -- When price is updated, update price_tier_1
  IF NEW.price IS NOT NULL AND (NEW.price_tier_1 IS NULL OR NEW.price_tier_1 != NEW.price) THEN
    NEW.price_tier_1 := NEW.price;
  END IF;
  
  -- Ensure quantity_tier_1 has a default value
  IF NEW.quantity_tier_1 IS NULL THEN
    NEW.quantity_tier_1 := 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_company_pricing_columns_trigger ON company_pricing;

-- Create the trigger
CREATE TRIGGER sync_company_pricing_columns_trigger
BEFORE INSERT OR UPDATE ON company_pricing
FOR EACH ROW
EXECUTE FUNCTION sync_company_pricing_columns();