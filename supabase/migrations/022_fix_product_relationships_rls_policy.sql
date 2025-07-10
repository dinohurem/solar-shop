-- Fix RLS policy for product_relationships table
-- The previous policy was checking profiles.id instead of profiles.user_id

-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "Admins can manage product relationships" ON product_relationships;

-- Create the corrected policy for admins
CREATE POLICY "Admins can manage product relationships" ON product_relationships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Also add a separate policy for company_admin users if needed
CREATE POLICY "Company admins can manage product relationships" ON product_relationships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'company_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'company_admin')
    )
  );

-- Add comment about the fix
COMMENT ON POLICY "Admins can manage product relationships" ON product_relationships IS 'Allows admin users to create, read, update, and delete product relationships';
COMMENT ON POLICY "Company admins can manage product relationships" ON product_relationships IS 'Allows admin and company_admin users to manage product relationships';