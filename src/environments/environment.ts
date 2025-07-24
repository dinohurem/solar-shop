export const environment = {
    production: false,
    supabaseUrl: 'https://ymkalmclgtcumzimvamu.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta2FsbWNsZ3RjdW16aW12YW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDU1MDEsImV4cCI6MjA2MTA4MTUwMX0.dKnWD6s1kuorkXvS15xUEWw4PcdIbnCkgOFJVh2NDCU',

    // App Configuration
    appUrl: 'http://localhost:4200', // Update this for production
    adminEmail: 'adminshop@sharklasers.com',

    // Monri Payment Gateway Configuration
    monri: {
        key: 'key-f909fd217f04ecdace0d565c9a65cdb8',
        authenticityToken: '2e438f62bff6e2862703bf155a361341958607ed',
        endpoint: 'https://ipgtest.monri.com', // Test endpoint
        formEndpoint: 'https://ipgtest.monri.com/v2/form',
        debug: true,
        successUrl: 'http://localhost:4200/payment-callback?status=approved',
        cancelUrl: 'http://localhost:4200/payment-callback?status=cancelled',
        redirectToSuccessUrl: true, // Enable redirect to success URL
        terminalRedirectToSuccessUrl: true
    }
}; 