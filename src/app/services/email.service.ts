import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
}

export interface EmailRequest {
    type: 'order-confirmation' | 'company-approval' | 'custom' | 'order-status-change';
    to: string;
    templateId?: string;
    dynamicTemplateData?: Record<string, any>;
    subject?: string;
    htmlContent?: string;
}

export interface WelcomeEmailData {
    to: string;
    firstName: string;
    lastName?: string;
    email: string;
}

export interface CompanyApprovalEmailData {
    to: string;
    companyName: string;
    companyEmail: string;
}

export interface OrderConfirmationEmailData {
    to: string;
    orderNumber: string;
    orderDate: string;
    customerName: string;
    customerEmail: string;
    items: Array<{
        productName: string;
        productSku: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    totalAmount: number;
}

export interface OrderStatusChangeEmailData {
    to: string;
    orderNumber: string;
    orderId: string;
    orderDate: string;
    customerName: string;
    customerEmail: string;
    newStatus: string;
}

@Injectable({
    providedIn: 'root'
})
export class EmailService {
    private readonly supabaseUrl = environment.supabaseUrl;
    private readonly supabaseKey = environment.supabaseKey;

    constructor(private supabaseService: SupabaseService) { }

    /**
     * Send order confirmation email
     */
    async sendOrderConfirmation(email: string, orderData: any): Promise<boolean> {
        try {
            const emailRequest: EmailRequest = {
                type: 'order-confirmation',
                to: email,
                dynamicTemplateData: {
                    orderNumber: orderData.orderNumber,
                    orderDate: orderData.orderDate,
                    totalAmount: orderData.totalAmount,
                    items: orderData.items,
                    shippingAddress: orderData.shippingAddress,
                    billingAddress: orderData.billingAddress,
                    trackingUrl: orderData.trackingUrl
                }
            };

            return await this.sendEmailViaEdgeFunction(emailRequest);
        } catch (error) {
            console.error('Error sending order confirmation:', error);
            return false;
        }
    }

    /**
     * Send company approval notification
     */
    async sendCompanyApprovalEmail(data: CompanyApprovalEmailData): Promise<boolean> {
        try {
            const emailRequest: EmailRequest = {
                type: 'company-approval',
                to: data.to,
                dynamicTemplateData: {
                    companyName: data.companyName,
                    companyEmail: data.companyEmail,
                    loginUrl: `${environment.appUrl}/login`
                }
            };

            return await this.sendEmailViaEdgeFunction(emailRequest);
        } catch (error) {
            console.error('Error sending company approval email:', error);
            return false;
        }
    }

    /**
     * Send order confirmation email to customer
     */
    async sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<boolean> {
        try {
            const emailRequest: EmailRequest = {
                type: 'order-confirmation',
                to: data.to,
                dynamicTemplateData: {
                    orderNumber: data.orderNumber,
                    orderDate: data.orderDate,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    items: data.items,
                    subtotal: data.subtotal,
                    taxAmount: data.taxAmount,
                    shippingCost: data.shippingCost,
                    totalAmount: data.totalAmount,
                    orderTrackingUrl: `${environment.appUrl}/orders/${data.orderNumber}`
                }
            };

            return await this.sendEmailViaEdgeFunction(emailRequest);
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
            return false;
        }
    }

    /**
     * Send order notification email to admin
     */
    async sendOrderNotificationToAdmin(data: OrderConfirmationEmailData): Promise<boolean> {
        try {
            const adminEmail = environment.adminEmail;
            const emailRequest: EmailRequest = {
                type: 'order-confirmation',
                to: adminEmail,
                dynamicTemplateData: {
                    orderNumber: data.orderNumber,
                    orderDate: data.orderDate,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    items: data.items,
                    subtotal: data.subtotal,
                    taxAmount: data.taxAmount,
                    shippingCost: data.shippingCost,
                    totalAmount: data.totalAmount,
                    orderTrackingUrl: `${environment.appUrl}/admin/orders/${data.orderNumber}`
                }
            };

            return await this.sendEmailViaEdgeFunction(emailRequest);
        } catch (error) {
            console.error('Error sending order notification to admin:', error);
            return false;
        }
    }

    /**
     * Send order status change notification to admin
     */
    async sendOrderStatusChangeNotificationToAdmin(data: OrderStatusChangeEmailData): Promise<boolean> {
        try {
            const adminEmail = environment.adminEmail;
            const emailRequest: EmailRequest = {
                type: 'order-status-change',
                to: adminEmail,
                dynamicTemplateData: {
                    orderNumber: data.orderNumber,
                    orderDate: data.orderDate,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    newStatus: data.newStatus,
                    orderTrackingUrl: `${environment.appUrl}/admin/orders/details/${data.orderId}`
                }
            };

            return await this.sendEmailViaEdgeFunction(emailRequest);
        } catch (error) {
            console.error('Error sending order status change notification to admin:', error);
            return false;
        }
    }

    /**
     * Send order status change email to customer
     */
    async sendOrderStatusChangeEmail(data: OrderStatusChangeEmailData): Promise<boolean> {
        try {
            const emailRequest: EmailRequest = {
                type: 'order-status-change',
                to: data.customerEmail,
                dynamicTemplateData: {
                    orderNumber: data.orderNumber,
                    orderDate: data.orderDate,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    newStatus: data.newStatus,
                    orderTrackingUrl: `${environment.appUrl}/order-details/${data.orderId}`
                }
            };

            return await this.sendEmailViaEdgeFunction(emailRequest);
        } catch (error) {
            console.error('Error sending order status change email:', error);
            return false;
        }
    }

    /**
     * Send a custom email with HTML content
     */
    async sendCustomEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
        try {
            const emailRequest: EmailRequest = {
                type: 'custom',
                to: to,
                subject: subject,
                htmlContent: htmlContent
            };

            return await this.sendEmailViaEdgeFunction(emailRequest);
        } catch (error) {
            console.error('Error sending custom email:', error);
            return false;
        }
    }

    /**
     * Send email via Supabase Edge Function
     */
    private async sendEmailViaEdgeFunction(emailRequest: EmailRequest): Promise<boolean> {
        try {
            // Get the Supabase client
            const supabase = this.supabaseService.client;

            // Call the Edge Function
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: emailRequest
            });

            if (error) {
                console.error('Edge function error:', error);
                return false;
            }

            if (data && data.success) {
                console.log('Email sent successfully to:', emailRequest.to);
                return true;
            } else {
                console.error('Email sending failed:', data);
                return false;
            }
        } catch (error) {
            console.error('Error calling email edge function:', error);
            return false;
        }
    }

    /**
     * Validate email format
     */
    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Get email template by ID (for future use with template management)
     */
    async getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
        try {
            const { data, error } = await this.supabaseService.client
                .from('email_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching email template:', error);
            return null;
        }
    }
} 