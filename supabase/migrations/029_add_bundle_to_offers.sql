-- Add bundle column to offers table
-- This flag indicates if the offer is a bundle offer (all products must be in cart for discount to apply)

ALTER TABLE offers
ADD COLUMN IF NOT EXISTS bundle BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN offers.bundle IS 'If true, all products from the offer must be in the cart for the discount to apply. For B2B offers, this is always true.';
