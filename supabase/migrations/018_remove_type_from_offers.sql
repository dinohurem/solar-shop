-- Migration: Remove type column from offers table
-- This migration removes the type column as it's no longer needed

-- Remove the type column from offers table
ALTER TABLE public.offers DROP COLUMN IF EXISTS type; 