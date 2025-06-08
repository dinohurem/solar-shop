import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'checkout.payment' | translate }}</h2>
      
      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
        <!-- Payment Method Selection -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'checkout.paymentMethod' | translate }}</h3>
          <div class="space-y-3">
            <!-- Credit Card -->
            <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="credit-card"
                formControlName="paymentMethod"
                class="text-[#0ACF83] focus:ring-[#0ACF83]"
              >
              <div class="ml-3 flex-1 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  <span class="font-medium text-[#324053] font-['DM_Sans']">Credit/Debit Card</span>
                </div>
                <div class="flex space-x-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" class="h-6">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/2560px-Mastercard-logo.svg.png" alt="Mastercard" class="h-6">
                </div>
              </div>
            </label>

            <!-- PayPal -->
            <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                formControlName="paymentMethod"
                class="text-[#0ACF83] focus:ring-[#0ACF83]"
              >
              <div class="ml-3 flex-1 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.421c-.315-.178-.7-.284-1.139-.284H12.85l-.523 3.322h1.139c1.524 0 2.71-.543 3.33-1.810.62-1.267.356-2.807-.574-3.807z"/>
                  </svg>
                  <span class="font-medium text-[#324053] font-['DM_Sans']">PayPal</span>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" alt="PayPal" class="h-6">
              </div>
            </label>

            <!-- Bank Transfer -->
            <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="bank-transfer"
                formControlName="paymentMethod"
                class="text-[#0ACF83] focus:ring-[#0ACF83]"
              >
              <div class="ml-3 flex-1">
                <div class="flex items-center space-x-3">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
                  </svg>
                  <span class="font-medium text-[#324053] font-['DM_Sans']">Bank Transfer</span>
                </div>
                <p class="text-sm text-gray-600 mt-1 ml-9 font-['DM_Sans']">You will receive the instructions via email</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Credit Card Details (shown when credit card is selected) -->
        <div *ngIf="paymentForm.get('paymentMethod')?.value === 'credit-card'" class="mb-8">
          <h3 class="text-lg font-semibold text-[#324053] mb-4 font-['Poppins']">Credit Card Details</h3>
          <div class="space-y-4">
            <div>
              <label for="cardNumber" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Credit Card Number *</label>
              <input
                type="text"
                id="cardNumber"
                formControlName="cardNumber"
                placeholder="1234 5678 9012 3456"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                maxlength="19"
                (input)="formatCardNumber($event)"
              >
              <div *ngIf="paymentForm.get('cardNumber')?.invalid && paymentForm.get('cardNumber')?.touched" class="mt-1 text-sm text-red-600">
                Insert a valid card number
              </div>
            </div>
            <div>
              <label for="cardName" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Card Name *</label>
              <input
                type="text"
                id="cardName"
                formControlName="cardName"
                placeholder="Mario Rossi"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
              >
              <div *ngIf="paymentForm.get('cardName')?.invalid && paymentForm.get('cardName')?.touched" class="mt-1 text-sm text-red-600">
                The card name is required
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Expiration Date *</label>
                <input
                  type="text"
                  id="expiryDate"
                  formControlName="expiryDate"
                  placeholder="MM/AA"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                  maxlength="5"
                  (input)="formatExpiryDate($event)"
                >
                <div *ngIf="paymentForm.get('expiryDate')?.invalid && paymentForm.get('expiryDate')?.touched" class="mt-1 text-sm text-red-600">
                  Insert a valid expiration date
                </div>
              </div>
              <div>
                <label for="cvv" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">CVV *</label>
                <input
                  type="text"
                  id="cvv"
                  formControlName="cvv"
                  placeholder="123"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                  maxlength="4"
                >
                <div *ngIf="paymentForm.get('cvv')?.invalid && paymentForm.get('cvv')?.touched" class="mt-1 text-sm text-red-600">
                  Insert a valid CVV
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="mb-8">
          <label class="flex items-start space-x-3">
            <input
              type="checkbox"
              formControlName="acceptTerms"
              class="mt-1 text-[#0ACF83] focus:ring-[#0ACF83] rounded"
            >
            <span class="text-sm text-gray-600 font-['DM_Sans']">
              I accept the <a href="#" class="text-[#0ACF83] hover:underline">terms and conditions</a> and the 
              <a href="#" class="text-[#0ACF83] hover:underline">privacy policy</a> *
            </span>
          </label>
          <div *ngIf="paymentForm.get('acceptTerms')?.invalid && paymentForm.get('acceptTerms')?.touched" class="mt-1 text-sm text-red-600">
            You must accept the terms and conditions
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button"
            (click)="goBack()"
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium font-['DM_Sans']"
          >
          {{ 'checkout.backStep' | translate }} {{ 'checkout.step2' | translate }}
          </button>
          <button 
            type="submit"
            [disabled]="paymentForm.invalid || isProcessing"
            class="flex-1 px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isProcessing">{{ 'checkout.completeOrder' | translate }}</span>
            <span *ngIf="isProcessing" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class PaymentComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  paymentForm: FormGroup;
  isProcessing = false;

  constructor() {
    this.paymentForm = this.fb.group({
      paymentMethod: ['credit-card', [Validators.required]],
      cardNumber: [''],
      cardName: [''],
      expiryDate: [''],
      cvv: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    });

    // Add conditional validators for credit card fields
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      const cardNumber = this.paymentForm.get('cardNumber');
      const cardName = this.paymentForm.get('cardName');
      const expiryDate = this.paymentForm.get('expiryDate');
      const cvv = this.paymentForm.get('cvv');

      if (method === 'credit-card') {
        cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)]);
        cardName?.setValidators([Validators.required]);
        expiryDate?.setValidators([Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]);
        cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      } else {
        cardNumber?.clearValidators();
        cardName?.clearValidators();
        expiryDate?.clearValidators();
        cvv?.clearValidators();
      }

      cardNumber?.updateValueAndValidity();
      cardName?.updateValueAndValidity();
      expiryDate?.updateValueAndValidity();
      cvv?.updateValueAndValidity();
    });
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      event.target.value = parts.join(' ');
      this.paymentForm.get('cardNumber')?.setValue(parts.join(' '));
    } else {
      event.target.value = '';
      this.paymentForm.get('cardNumber')?.setValue('');
    }
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.paymentForm.get('expiryDate')?.setValue(value);
  }

  onSubmit() {
    this.isProcessing = true;

    // Process payment and create order
    setTimeout(() => {
      console.log('Payment form data:', this.paymentForm.value);
      this.createOrder();
    }, 2000);
  }

  private createOrder() {
    // TODO: Implement order creation logic
    // This will create an order with status 'pending' in the database
    console.log('Creating order...');
    this.isProcessing = false;

    // Navigate to success page or show success message
    alert('Order created successfully! Status: Pending - Admin will review your order.');
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/checkout/shipping']);
  }
} 