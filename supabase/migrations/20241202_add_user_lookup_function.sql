-- =====================================================
-- USER LOOKUP FUNCTION MIGRATION
-- File: 20241202_add_user_lookup_function.sql
-- Description: Add database function to find users by email for order creation
-- =====================================================

-- Create a function to find user by email and return user_id
CREATE OR REPLACE FUNCTION public.find_user_by_email(user_email TEXT)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        au.email::TEXT,
        p.first_name,
        p.last_name,
        p.full_name,
        p.role
    FROM public.profiles p
    INNER JOIN auth.users au ON au.id = p.user_id
    WHERE LOWER(au.email) = LOWER(user_email)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.find_user_by_email(TEXT) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.find_user_by_email(TEXT) IS 'Find user by email address and return user details including profile information';

COMMIT; 