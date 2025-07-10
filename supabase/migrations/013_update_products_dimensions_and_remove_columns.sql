-- Migration: Update products table
-- 1. Change dimensions column to TEXT
-- 2. Remove in_stock, stock_threshold, and subcategory columns

ALTER TABLE public.products
    ALTER COLUMN dimensions TYPE TEXT
    USING
      CASE
        WHEN pg_typeof(dimensions)::text = 'json' OR pg_typeof(dimensions)::text = 'jsonb'
          THEN dimensions::text
        ELSE dimensions::text
      END,
    DROP COLUMN IF EXISTS in_stock,
    DROP COLUMN IF EXISTS stock_threshold,
    DROP COLUMN IF EXISTS subcategory;

-- (Optional) Add a comment for future reference
COMMENT ON COLUMN public.products.dimensions IS 'Product dimensions as a string, e.g. 100x50x20cm, 10x5x2m, etc.'; 