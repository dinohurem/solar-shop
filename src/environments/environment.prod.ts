export const environment = {
    production: true,
    // Production Supabase Configuration
    supabaseUrl: 'https://efmzuxsxgnhzhczhqfpn.supabase.co', // Update with production Supabase URL
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbXp1eHN4Z25oemhjemhxZnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTk3OTEsImV4cCI6MjA2ODY3NTc5MX0.7DIYIyEt-zz7nV4p7-R-daiBOVPgME0AgIfeCKUcKPM', // Update with production Supabase anon key

    // App Configuration
    appUrl: 'https://solar-shop-rose.vercel.app/', // Update this with your production domain
    adminEmail: 'adminshop@sharklasers.com',

    // Monri Payment Gateway Configuration (Production)
    monri: {
        key: 'YOUR_PRODUCTION_MONRI_KEY', // Update with production Monri key
        authenticityToken: 'YOUR_PRODUCTION_MONRI_TOKEN', // Update with production Monri token
        endpoint: 'https://ipg.monri.com', // Production endpoint
        formEndpoint: 'https://ipg.monri.com/v2/form',
        debug: false, // Disable debug in production
        successUrl: 'https://solar-shop-rose.vercel.app/payment-callback?status=approved',
        cancelUrl: 'https://solar-shop-rose.vercel.app/payment-callback?status=cancelled',
        redirectToSuccessUrl: true,
        terminalRedirectToSuccessUrl: true
    }
}; 