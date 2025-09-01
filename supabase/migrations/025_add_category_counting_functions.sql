-- Migration: Add PostgreSQL functions for accurate category product counting
-- Created: 2025-01-09
-- Purpose: Fix category product count discrepancies between display and filtering
-- 
-- This migration adds two PostgreSQL functions:
-- 1. get_distinct_product_counts_by_categories: Gets distinct product counts for multiple categories
-- 2. get_hierarchical_product_count: Gets distinct count for parent + subcategories

-- Function 1: Get distinct product counts for multiple categories
-- This avoids double-counting products that appear in multiple categories
CREATE OR REPLACE FUNCTION get_distinct_product_counts_by_categories(category_ids UUID[])
RETURNS TABLE (category_id UUID, product_count INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        input_cat.cat_id as category_id,
        COALESCE(counts.product_count, 0)::INTEGER as product_count
    FROM unnest(category_ids) as input_cat(cat_id)
    LEFT JOIN (
        SELECT 
            combined_products.cat_id,
            COUNT(DISTINCT combined_products.product_id)::INTEGER as product_count
        FROM (
            -- Products where category_id matches (main category)
            SELECT 
                p.category_id as cat_id,
                p.id as product_id
            FROM products p
            WHERE p.category_id = ANY(category_ids)
              AND p.is_active = true
            
            UNION
            
            -- Products where additional categories match (product_categories table)
            SELECT 
                pc.category_id as cat_id,
                pc.product_id as product_id
            FROM product_categories pc
            JOIN products p ON pc.product_id = p.id
            WHERE pc.category_id = ANY(category_ids)
              AND p.is_active = true
        ) combined_products
        GROUP BY combined_products.cat_id
    ) counts ON input_cat.cat_id = counts.cat_id;
END;
$$;

-- Function 2: Get hierarchical product count (parent + subcategories)
-- This ensures parent categories show the correct distinct count when including subcategories
CREATE OR REPLACE FUNCTION get_hierarchical_product_count(parent_category_id UUID, subcategory_ids UUID[])
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_count INTEGER;
BEGIN
    -- Get distinct count of products that match parent category OR any subcategory
    -- This matches the filtering logic used in the frontend components
    SELECT COUNT(DISTINCT product_id)
    INTO total_count
    FROM (
        -- Products where category_id matches parent or any subcategory (main category)
        SELECT p.id as product_id
        FROM products p
        WHERE (p.category_id = parent_category_id OR p.category_id = ANY(subcategory_ids))
          AND p.is_active = true
        
        UNION
        
        -- Products where additional categories match parent or any subcategory (product_categories table)
        SELECT pc.product_id as product_id
        FROM product_categories pc
        JOIN products p ON pc.product_id = p.id
        WHERE (pc.category_id = parent_category_id OR pc.category_id = ANY(subcategory_ids))
          AND p.is_active = true
    ) combined_products;

    RETURN COALESCE(total_count, 0);
END;
$$;

-- Add comments to document the functions
COMMENT ON FUNCTION get_distinct_product_counts_by_categories(UUID[]) IS 
'Returns distinct product counts for multiple categories. Avoids double-counting products that exist in both main and additional categories.';

COMMENT ON FUNCTION get_hierarchical_product_count(UUID, UUID[]) IS 
'Returns distinct product count for a parent category plus all its subcategories. Used for hierarchical category display counts.';