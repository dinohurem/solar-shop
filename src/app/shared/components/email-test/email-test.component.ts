import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmailService } from '../../../services/email.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-email-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-8 font-['Poppins']">
            Email Service Test
          </h1>
          
          <!-- Test Form -->
          <form [formGroup]="testForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                formControlName="email" 
                type="email" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                placeholder="Enter email address"
              >
              <div *ngIf="testForm.get('email')?.invalid && testForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
                Please enter a valid email address
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input 
                formControlName="firstName" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                placeholder="Enter first name"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input 
                formControlName="lastName" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                placeholder="Enter last name"
              >
            </div>

            <!-- Company Approval Fields -->
            <div *ngIf="testForm.get('emailType')?.value === 'company-approval'" class="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Company Information</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input 
                  formControlName="companyName" 
                  type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                  placeholder="Enter company name"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Type
              </label>
              <select 
                formControlName="emailType" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
              >
                <option value="order-confirmation">Order Confirmation</option>
                <option value="company-approval">Company Approval</option>
                <option value="order-status-change">Order Status Change Email</option>
              </select>
            </div>

            <button 
              type="submit" 
              [disabled]="testForm.invalid || isSending"
              class="w-full bg-solar-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-solar-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <span *ngIf="!isSending">Send Test Email</span>
              <span *ngIf="isSending">Sending...</span>
            </button>
          </form>

          <!-- Results -->
          <div *ngIf="result" class="mt-8 p-4 rounded-lg" [class]="result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center">
              <svg *ngIf="result.success" class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg *ngIf="!result.success" class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span [class]="result.success ? 'text-green-800' : 'text-red-800'" class="font-medium">
                {{ result.message }}
              </span>
            </div>
          </div>

          <!-- Instructions -->
          <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-blue-900 mb-2">Setup Instructions</h3>
            <ol class="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Get your SendGrid API key from the SendGrid dashboard</li>
              <li>Update the <code>sendGridApiKey</code> in your environment files</li>
              <li>Create email templates in SendGrid and update the template IDs</li>
              <li>Test the email functionality using this form</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmailTestComponent {
  testForm: FormGroup;
  isSending = false;
  result: { success: boolean; message: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.testForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      emailType: ['order-confirmation', [Validators.required]],
      // Company approval fields
      companyName: ['']
    });
  }

  async onSubmit(): Promise<void> {
    if (this.testForm.valid) {
      this.isSending = true;
      this.result = null;

      const formData = this.testForm.value;

      try {
        let success = false;

        switch (formData.emailType) {
          case 'order-confirmation':
            success = await this.emailService.sendOrderConfirmationEmail({
              to: formData.email,
              orderNumber: 'TEST-ORDER-123',
              orderDate: new Date().toLocaleDateString('hr-HR'),
              customerName: `${formData.firstName} ${formData.lastName}`,
              customerEmail: formData.email,
              items: [
                {
                  productName: 'Solar Panel 300W',
                  productSku: 'SP-300W-001',
                  quantity: 2,
                  unitPrice: 149.99,
                  totalPrice: 299.98
                },
                {
                  productName: 'Solar Inverter 2000W',
                  productSku: 'SI-2000W-001',
                  quantity: 1,
                  unitPrice: 299.99,
                  totalPrice: 299.99
                }
              ],
              subtotal: 599.97,
              taxAmount: 119.99,
              shippingCost: 25.00,
              totalAmount: 744.96
            });
            break;

          case 'company-approval':
            success = await this.emailService.sendCompanyApprovalEmail({
              to: formData.email,
              companyName: formData.companyName || 'Test Company Ltd.',
              companyEmail: formData.email
            });
            break;

          case 'order-status-change':
            success = await this.emailService.sendOrderStatusChangeEmail({
              to: formData.email,
              orderNumber: 'TEST-ORDER-123',
              orderId: '123',
              orderDate: new Date().toLocaleDateString('hr-HR'),
              customerName: `${formData.firstName} ${formData.lastName}`,
              customerEmail: formData.email,
              newStatus: 'Shipped',
            });
            break;

          default:
            throw new Error('Invalid email type');
        }

        this.result = {
          success,
          message: success
            ? `Test ${formData.emailType} email sent successfully to ${formData.email}`
            : `Failed to send ${formData.emailType} email. Check console for details.`
        };
      } catch (error) {
        console.error('Email test error:', error);
        this.result = {
          success: false,
          message: `Error sending email: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      } finally {
        this.isSending = false;
      }
    }
  }
}