import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MonriPaymentRequest {
  order_number: string;
  amount: number; // Amount in cents (e.g., 1000 = 10.00 EUR)
  currency: string;
  order_info?: string;
  ch_full_name?: string;
  ch_address?: string;
  ch_city?: string;
  ch_zip?: string;
  ch_country?: string;
  ch_phone?: string;
  ch_email?: string;
  language?: string;
  transaction_type?: 'purchase' | 'authorize';
  number_of_installments?: string;
  custom_params?: string;
}

export interface MonriPaymentResponse {
  status: string;
  client_secret?: string;
  payment_id?: string;
  error?: string;
  error_message?: string;
}

export interface MonriFormParams {
  key: string;
  digest: string;
  order_number: string;
  amount: number;
  currency: string;
  order_info?: string;
  ch_full_name?: string;
  ch_address?: string;
  ch_city?: string;
  ch_zip?: string;
  ch_country?: string;
  ch_phone?: string;
  ch_email?: string;
  language?: string;
  transaction_type?: string;
  number_of_installments?: string;
  custom_params?: string;
  authenticity_token: string;
  success_url?: string;
  cancel_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MonriPaymentService {
  private readonly monriConfig = environment.monri;

  constructor(private http: HttpClient) {}

  /**
   * Create payment request and get form parameters for Monri
   */
  async createPaymentRequest(paymentData: MonriPaymentRequest): Promise<MonriFormParams> {
    // First create all parameters without digest
    const params: MonriFormParams = {
      key: this.monriConfig.key,
      digest: '', // Will be set below
      order_number: paymentData.order_number,
      amount: paymentData.amount,
      currency: paymentData.currency || 'EUR',
      authenticity_token: this.monriConfig.authenticityToken,
      language: paymentData.language || 'hr',
      transaction_type: paymentData.transaction_type || 'purchase',
      success_url: this.monriConfig.successUrl,
      cancel_url: this.monriConfig.cancelUrl,
      order_info: paymentData.order_info || `Solar Shop Order ${paymentData.order_number}` // Required parameter
    };

    // Add other optional parameters
    if (paymentData.order_info && paymentData.order_info !== params.order_info) {
      params.order_info = paymentData.order_info;
    }
    if (paymentData.ch_full_name) params.ch_full_name = paymentData.ch_full_name;
    if (paymentData.ch_address) params.ch_address = paymentData.ch_address;
    if (paymentData.ch_city) params.ch_city = paymentData.ch_city;
    if (paymentData.ch_zip) params.ch_zip = paymentData.ch_zip;
    if (paymentData.ch_country) params.ch_country = paymentData.ch_country;
    if (paymentData.ch_phone) params.ch_phone = paymentData.ch_phone;
    if (paymentData.ch_email) params.ch_email = paymentData.ch_email;
    if (paymentData.number_of_installments) params.number_of_installments = paymentData.number_of_installments;
    if (paymentData.custom_params) params.custom_params = paymentData.custom_params;

    // Generate digest with all parameters
    params.digest = await this.generateDigest(params);

    return params;
  }

  /**
   * Submit payment form to Monri
   */
  submitPaymentForm(formParams: MonriFormParams): void {
    // Log parameters for debugging (remove in production)
    console.log('Monri form parameters:', formParams);
    
    // Create a hidden form and submit it to Monri
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.monriConfig.formEndpoint;
    form.style.display = 'none';

    // Add all parameters as hidden inputs
    Object.entries(formParams).forEach(([key, value]) => {
      // Skip digest if it's empty, undefined, or null
      if (key === 'digest' && (!value || value === '')) {
        console.log('Skipping empty digest field');
        return;
      }
      
      if (value !== undefined && value !== null) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value.toString();
        form.appendChild(input);
        console.log(`Adding form field: ${key} = ${value}`);
      }
    });

    document.body.appendChild(form);
    console.log('Submitting form to:', form.action);
    form.submit();
    document.body.removeChild(form);
  }

  /**
   * Generate digest for payment authentication
   * Note: In production, this should be done on the server side for security
   */
  private async generateDigest(params: MonriFormParams): Promise<string> {
    console.log('Generating Monri digest with available credentials...');
    
    // Simple digest method: Just the required parameters (as shown in docs example)
    // digest = SHA512(key + order_number + amount + currency)
    const message = `${params.key}${params.order_number}${params.amount}${params.currency}`;
    console.log('Using digest method (key + order_number + amount + currency):', message);
    
    try {
      const encoder = new TextEncoder();
      const messageData = encoder.encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-512', messageData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('Generated SHA-512 digest:', hashHex);
      return hashHex;
    } catch (error) {
      console.error('Error generating digest:', error);
      
      // Fallback: return empty string
      console.log('Digest generation failed, trying without digest...');
      return '';
    }
  }

  /**
   * Check payment status
   */
  checkPaymentStatus(orderNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(
      `${this.monriConfig.endpoint}/api/v1/payment/status/${orderNumber}`,
      { headers }
    );
  }

  /**
   * Process payment callback from Monri
   */
  processPaymentCallback(callbackData: any): Observable<any> {
    // Verify the callback authenticity and process the payment result
    return from(Promise.resolve(callbackData));
  }

  /**
   * Validate callback authenticity
   */
  validateCallback(callbackData: any): boolean {
    // Implement callback validation logic
    // Verify digest and other security parameters
    return true; // Simplified for now
  }

  /**
   * Format amount to cents (Monri expects amounts in smallest currency unit)
   */
  formatAmountToCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Format amount from cents to currency
   */
  formatAmountFromCents(cents: number): number {
    return cents / 100;
  }
}