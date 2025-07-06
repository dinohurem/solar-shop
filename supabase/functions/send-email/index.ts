import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    type: 'order-confirmation' | 'company-approval' | 'order-status-change';
    to: string;
    templateId?: string;
    dynamicTemplateData?: Record<string, any>;
    subject?: string;
    htmlContent?: string;
}

interface SendGridRequest {
    personalizations: Array<{
        to: Array<{ email: string }>;
        dynamic_template_data?: Record<string, any>;
    }>;
    from: {
        email: string;
        name: string;
    };
    template_id?: string;
    subject?: string;
    content?: Array<{
        type: string;
        value: string;
    }>;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get environment variables
        const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
        const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@solarshop.hr'
        const fromName = Deno.env.get('FROM_NAME') || 'SolarShop'
        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:4200'

        if (!sendGridApiKey) {
            throw new Error('SENDGRID_API_KEY environment variable is required')
        }

        // Parse request body
        const emailRequest: EmailRequest = await req.json()

        // Validate required fields
        if (!emailRequest.to || !emailRequest.type) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: to, type' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(emailRequest.to)) {
            return new Response(
                JSON.stringify({ error: 'Invalid email format' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Prepare SendGrid request based on email type
        let sendGridRequest: SendGridRequest

        switch (emailRequest.type) {
            case 'order-confirmation':
                sendGridRequest = await prepareOrderConfirmationEmail(emailRequest, fromEmail, fromName, appUrl)
                break
            case 'company-approval':
                sendGridRequest = await prepareCompanyApprovalEmail(emailRequest, fromEmail, fromName, appUrl)
                break
            case 'order-status-change':
                sendGridRequest = await prepareOrderStatusChangeEmail(emailRequest, fromEmail, fromName, appUrl)
                break
            case 'custom':
                sendGridRequest = await prepareCustomEmail(emailRequest, fromEmail, fromName)
                break
            default:
                return new Response(
                    JSON.stringify({ error: 'Invalid email type' }),
                    {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    }
                )
        }

        // Send email via SendGrid
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sendGridApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendGridRequest),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('SendGrid API error:', response.status, errorText)
            return new Response(
                JSON.stringify({
                    error: 'Failed to send email',
                    details: errorText
                }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email sent successfully'
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Email function error:', error)
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                details: error.message
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})

async function prepareCompanyApprovalEmail(
    request: EmailRequest,
    fromEmail: string,
    fromName: string,
    appUrl: string
): Promise<SendGridRequest> {
    const templateId = Deno.env.get('SENDGRID_TEMPLATE_COMPANY_APPROVED') || 'd-company-approval-template-id'

    return {
        personalizations: [{
            to: [{ email: request.to }],
            dynamic_template_data: {
                companyName: request.dynamicTemplateData?.companyName || 'Company',
                companyEmail: request.dynamicTemplateData?.companyEmail || request.to,
                loginUrl: `${appUrl}/login`,
                facebookUrl: 'https://facebook.com/solarshop',
                instagramUrl: 'https://instagram.com/solarshop',
                youtubeUrl: 'https://youtube.com/solarshop'
            }
        }],
        from: {
            email: fromEmail,
            name: fromName
        },
        template_id: templateId
    }
}

async function prepareOrderConfirmationEmail(
    request: EmailRequest,
    fromEmail: string,
    fromName: string,
    appUrl: string
): Promise<SendGridRequest> {
    const templateId = Deno.env.get('SENDGRID_TEMPLATE_ORDER_SUBMITTED') || 'd-order-confirmation-template-id'

    return {
        personalizations: [{
            to: [{ email: request.to }],
            dynamic_template_data: {
                orderNumber: request.dynamicTemplateData?.orderNumber || 'ORDER-123',
                orderDate: request.dynamicTemplateData?.orderDate || new Date().toISOString(),
                customerName: request.dynamicTemplateData?.customerName || 'Customer',
                customerEmail: request.dynamicTemplateData?.customerEmail || request.to,
                items: request.dynamicTemplateData?.items || [],
                subtotal: request.dynamicTemplateData?.subtotal || 0,
                taxAmount: request.dynamicTemplateData?.taxAmount || 0,
                shippingCost: request.dynamicTemplateData?.shippingCost || 0,
                totalAmount: request.dynamicTemplateData?.totalAmount || 0,
                orderTrackingUrl: request.dynamicTemplateData?.orderTrackingUrl || `${appUrl}/orders`,
                facebookUrl: 'https://facebook.com/solarshop',
                instagramUrl: 'https://instagram.com/solarshop',
                youtubeUrl: 'https://youtube.com/solarshop'
            }
        }],
        from: {
            email: fromEmail,
            name: fromName
        },
        template_id: templateId
    }
}

async function prepareOrderStatusChangeEmail(
    request: EmailRequest,
    fromEmail: string,
    fromName: string,
    appUrl: string
): Promise<SendGridRequest> {
    const templateId = Deno.env.get('SENDGRID_TEMPLATE_ORDER_STATUS_CHANGED') || 'd-order-status-change-template-id'

    return {
        personalizations: [{
            to: [{ email: request.to }],
            dynamic_template_data: {
                orderNumber: request.dynamicTemplateData?.orderNumber || 'ORDER-123',
                orderDate: request.dynamicTemplateData?.orderDate || new Date().toISOString(),
                customerName: request.dynamicTemplateData?.customerName || 'Customer',
                customerEmail: request.dynamicTemplateData?.customerEmail || request.to,
                newStatus: request.dynamicTemplateData?.newStatus || 'Shipped',
                orderTrackingUrl: request.dynamicTemplateData?.orderTrackingUrl || `${appUrl}/orders`,
                facebookUrl: 'https://facebook.com/solarshop',
                instagramUrl: 'https://instagram.com/solarshop',
                youtubeUrl: 'https://youtube.com/solarshop'
            }
        }],
        from: {
            email: fromEmail,
            name: fromName
        },
        template_id: templateId
    }
}

async function prepareCustomEmail(
    request: EmailRequest,
    fromEmail: string,
    fromName: string
): Promise<SendGridRequest> {
    if (!request.subject || !request.htmlContent) {
        throw new Error('Subject and HTML content are required for custom emails')
    }

    return {
        personalizations: [{
            to: [{ email: request.to }]
        }],
        from: {
            email: fromEmail,
            name: fromName
        },
        subject: request.subject,
        content: [{
            type: 'text/html',
            value: request.htmlContent
        }]
    }
} 