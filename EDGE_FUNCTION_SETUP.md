# Supabase Edge Function Setup for Email Service

This guide will help you deploy the email Edge Function to Supabase and configure it securely.

## Overview

The email system now uses Supabase Edge Functions to securely send emails without exposing API keys in the frontend. The Edge Function handles all SendGrid communication on the backend.

## Prerequisites

1. **Supabase CLI**: Install the Supabase CLI
2. **SendGrid Account**: Set up SendGrid as described in the previous guide
3. **Supabase Project**: Ensure you have a Supabase project set up

## Setup Instructions

### 1. Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Using yarn
yarn global add supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
# Navigate to your project directory
cd your-project-directory

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference ID.

### 4. Set Environment Variables

Set the required environment variables in your Supabase project:

```bash
# Set SendGrid API Key
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key_here

# Set email configuration
supabase secrets set FROM_EMAIL=noreply@solarshop.hr
supabase secrets set FROM_NAME=SolarShop
supabase secrets set APP_URL=https://solarshop.hr

# Set template IDs (update with your actual template IDs)
supabase secrets set SENDGRID_WELCOME_TEMPLATE_ID=d-welcome-template-id
supabase secrets set SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-password-reset-template-id
supabase secrets set SENDGRID_NEWSLETTER_TEMPLATE_ID=d-newsletter-template-id
supabase secrets set SENDGRID_ORDER_TEMPLATE_ID=d-order-template-id
supabase secrets set SENDGRID_PARTNER_APPROVAL_TEMPLATE_ID=d-partner-approval-template-id
```

### 5. Deploy the Edge Function

```bash
# Deploy the send-email function
supabase functions deploy send-email
```

### 6. Test the Edge Function

You can test the function locally before deploying:

```bash
# Start local development
supabase start

# Test the function locally
curl -X POST http://localhost:54321/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "dynamicTemplateData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "test@example.com"
    }
  }'
```

## Environment Variables

The Edge Function uses these environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `SENDGRID_API_KEY` | Your SendGrid API key | Yes |
| `FROM_EMAIL` | Sender email address | No (default: noreply@solarshop.hr) |
| `FROM_NAME` | Sender name | No (default: SolarShop) |
| `APP_URL` | Your application URL | No (default: http://localhost:4200) |
| `SENDGRID_WELCOME_TEMPLATE_ID` | Welcome email template ID | No |
| `SENDGRID_PASSWORD_RESET_TEMPLATE_ID` | Password reset template ID | No |
| `SENDGRID_NEWSLETTER_TEMPLATE_ID` | Newsletter template ID | No |
| `SENDGRID_ORDER_TEMPLATE_ID` | Order confirmation template ID | No |
| `SENDGRID_PARTNER_APPROVAL_TEMPLATE_ID` | Partner approval template ID | No |

## Security Benefits

### Before (Frontend Email Sending)
❌ API key exposed in frontend code  
❌ API key visible in browser network tab  
❌ API key in version control  
❌ No rate limiting on frontend  
❌ No authentication required  

### After (Edge Function)
✅ API key stored securely on backend  
✅ API key never exposed to frontend  
✅ API key not in version control  
✅ Built-in rate limiting  
✅ Supabase authentication required  
✅ Request validation and sanitization  

## Function Features

### Email Types Supported
- **welcome**: Welcome email for new users
- **password-reset**: Password reset email
- **newsletter**: Newsletter subscription confirmation
- **order-confirmation**: Order confirmation with details
- **partner-approval**: Partner approval notification
- **custom**: Custom HTML emails

### Request Validation
- Email format validation
- Required field validation
- Email type validation
- Input sanitization

### Error Handling
- Detailed error messages
- Proper HTTP status codes
- CORS support
- Logging for debugging

## Testing

### Using the Test Component
The existing test component (`/email-test`) will now call the Edge Function instead of direct SendGrid API.

### Manual Testing
```bash
# Test welcome email
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "type": "welcome",
    "to": "test@example.com",
    "dynamicTemplateData": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }'
```

## Monitoring

### View Function Logs
```bash
# View function logs
supabase functions logs send-email

# Follow logs in real-time
supabase functions logs send-email --follow
```

### Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to Edge Functions
3. Click on `send-email`
4. View logs and metrics

## Troubleshooting

### Common Issues

#### Function Not Found
```bash
# Ensure function is deployed
supabase functions deploy send-email

# Check function status
supabase functions list
```

#### Environment Variables Not Set
```bash
# List current secrets
supabase secrets list

# Set missing variables
supabase secrets set VARIABLE_NAME=value
```

#### CORS Issues
The function includes CORS headers, but ensure your frontend is making requests from an allowed origin.

#### Authentication Issues
Ensure you're using the correct Supabase anon key and that the user is authenticated if required.

### Debug Mode
Enable detailed logging by checking the Supabase dashboard or using the CLI logs command.

## Production Deployment

### 1. Set Production Environment Variables
```bash
# Set production values
supabase secrets set APP_URL=https://solarshop.hr
supabase secrets set FROM_EMAIL=noreply@solarshop.hr
```

### 2. Deploy to Production
```bash
# Deploy the function
supabase functions deploy send-email --project-ref YOUR_PROJECT_REF
```

### 3. Update Frontend Configuration
Ensure your frontend environment files have the correct Supabase URL and anon key.

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Monitor function logs** for suspicious activity
5. **Set up alerts** for failed email attempts
6. **Use rate limiting** to prevent abuse

## Cost Considerations

- Supabase Edge Functions have usage limits
- Monitor your function calls to stay within limits
- Consider implementing caching for frequently used data
- Set up alerts for approaching limits

## Next Steps

1. Deploy the Edge Function
2. Test with the test component
3. Monitor logs and performance
4. Set up alerts and monitoring
5. Update your production environment

The email system is now secure and ready for production use! 