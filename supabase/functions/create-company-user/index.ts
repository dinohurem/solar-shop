// Edge Function to create a company user
// This function has access to the service role key and can create users via Admin API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-my-custom-header': 'supabase-admin'
          }
        }
      }
    )

    // Create regular client to verify the calling user is an admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Verify caller is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || !['admin', 'company_admin'].includes(profile.role)) {
      throw new Error('Only admins can create company users')
    }

    // Parse request body
    const body = await req.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))

    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      companyName,
      taxNumber,
      companyAddress,
      companyPhone,
      companyEmail,
      website,
      businessType,
      yearsInBusiness,
      annualRevenue,
      numberOfEmployees,
      description,
      status
    } = body

    // Step 1: Create auth user with admin API
    console.log('Creating auth user with email:', email || companyEmail)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email || companyEmail,
      email_confirm: false, // User needs to confirm
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        role: 'customer'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      throw new Error(`Failed to create user: ${authError.message}`)
    }

    if (!authUser || !authUser.user) {
      console.error('No user data returned from auth.admin.createUser')
      throw new Error('No user data returned')
    }

    const newUserId = authUser.user.id
    console.log('Created auth user with ID:', newUserId)

    try {
      // Step 2: Update profile (it was auto-created by the trigger)
      console.log('Updating profile for user:', newUserId)

      // Wait a bit for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      const profileData = {
        first_name: firstName,
        last_name: lastName,
        role: 'customer',
        phone: phoneNumber || null
      }
      console.log('Profile data:', JSON.stringify(profileData, null, 2))

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileData)
        .eq('user_id', newUserId)

      if (profileError) {
        console.error('Profile error:', JSON.stringify(profileError, null, 2))
        // Clean up auth user
        await supabaseAdmin.auth.admin.deleteUser(newUserId)
        throw new Error(`Failed to update profile: ${profileError.message}`)
      }
      console.log('Profile updated successfully')

      // Step 3: Create company record
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          contact_person_id: newUserId,
          first_name: firstName,
          last_name: lastName,
          email: email || companyEmail,
          phone_number: phoneNumber || null,
          company_name: companyName,
          tax_number: taxNumber,
          company_address: companyAddress,
          company_phone: companyPhone,
          company_email: companyEmail,
          website: website || null,
          business_type: businessType,
          years_in_business: yearsInBusiness,
          annual_revenue: annualRevenue || null,
          number_of_employees: numberOfEmployees || null,
          description: description || null,
          status: status || 'pending',
          approved: status === 'approved'
        })
        .select(`
          *,
          contact_person:profiles!companies_contact_person_id_fkey(
            full_name
          )
        `)
        .single()

      if (companyError) {
        console.error('Company error:', companyError)
        // Clean up
        await supabaseAdmin.auth.admin.deleteUser(newUserId)
        throw new Error(`Failed to create company: ${companyError.message}`)
      }

      // Step 4: Send invitation email
      console.log('Sending invitation email to:', email || companyEmail)
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email || companyEmail,
        {
          redirectTo: `${req.headers.get('origin') || 'http://localhost:4200'}/profil?tab=account`
        }
      )

      if (inviteError) {
        console.error('Invitation email error:', inviteError)
        // Don't fail - user is created, just email didn't send
      } else {
        console.log('Invitation email sent successfully')
      }

      return new Response(
        JSON.stringify({
          success: true,
          company: company,
          message: 'Company created successfully. Invitation email sent.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } catch (error) {
      // Clean up on any error
      try {
        await supabaseAdmin.auth.admin.deleteUser(newUserId)
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }
      throw error
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
