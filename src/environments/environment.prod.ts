export const environment = {
    production: true,
    // Production Supabase Configuration
    supabaseUrl: 'https://efmzuxsxgnhzhczhqfpn.supabase.co', // Update with production Supabase URL
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbXp1eHN4Z25oemhjemhxZnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTk3OTEsImV4cCI6MjA2ODY3NTc5MX0.7DIYIyEt-zz7nV4p7-R-daiBOVPgME0AgIfeCKUcKPM', // Update with production Supabase anon key

    // App Configuration
    appUrl: 'https://solar-shop-rose.vercel.app/', // Update this with your production domain
    adminEmail: 'adminshop@sharklasers.com',

    // Monri Payment Gateway Configuration (Production)
    // IMPORTANT: For now, use TEST endpoint until you get production credentials from Monri
    monri: {
        key: 'key-f909fd217f04ecdace0d565c9a65cdb8', // This is a TEST key - get production key from Monri
        authenticityToken: '2e438f62bff6e2862703bf155a361341958607ed', // This is a TEST token - get production token from Monri
        endpoint: 'https://ipgtest.monri.com', // Use TEST endpoint for now
        formEndpoint: 'https://ipgtest.monri.com/v2/form', // Use TEST form endpoint for now
        debug: false, // Keep debug off in production
        successUrl: 'https://solar-shop-rose.vercel.app/payment-callback?status=approved',
        cancelUrl: 'https://solar-shop-rose.vercel.app/payment-callback?status=cancelled',
        redirectToSuccessUrl: true,
        terminalRedirectToSuccessUrl: true
    }
}; 