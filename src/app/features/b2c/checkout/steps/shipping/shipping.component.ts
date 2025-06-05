import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">{{ 'checkout.step2' | translate }}</h2>
      
      <form [formGroup]="shippingForm" (ngSubmit)="onSubmit()">
        <!-- Contact Information -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'checkout.personalInfo' | translate }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">{{ 'checkout.firstName' | translate }} *</label>
              <input
                type="text"
                id="firstName"
                formControlName="firstName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-500 focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.firstName' | translate"
              >
              <div *ngIf="shippingForm.get('firstName')?.invalid && shippingForm.get('firstName')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'checkout.firstNameRequired' | translate }}
              </div>
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Last Name *</label>
              <input
                type="text"
                id="lastName"
                formControlName="lastName"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.lastName' | translate"
              >
              <div *ngIf="shippingForm.get('lastName')?.invalid && shippingForm.get('lastName')?.touched" class="mt-1 text-sm text-red-600">
                The last name is required
              </div>
            </div>
            <div class="md:col-span-2">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Email *</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.email' | translate"
              >
              <div *ngIf="shippingForm.get('email')?.invalid && shippingForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
                Insert a valid email
              </div>
            </div>
            <div class="md:col-span-2">
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Phone *</label>
              <input
                type="tel"
                id="phone"
                formControlName="phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.phone' | translate"
              >
              <div *ngIf="shippingForm.get('phone')?.invalid && shippingForm.get('phone')?.touched" class="mt-1 text-sm text-red-600">
                The phone number is required
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-[#324053] mb-4 font-['Poppins']">Shipping Address</h3>
          <div class="space-y-4">
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Address *</label>
              <input
                type="text"
                id="address"
                formControlName="address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                [placeholder]="'checkout.address' | translate"
              >
              <div *ngIf="shippingForm.get('address')?.invalid && shippingForm.get('address')?.touched" class="mt-1 text-sm text-red-600">
                The address is required
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">City *</label>
                <input
                  type="text"
                  id="city"
                  formControlName="city"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                  [placeholder]="'checkout.city' | translate"
                >
                <div *ngIf="shippingForm.get('city')?.invalid && shippingForm.get('city')?.touched" class="mt-1 text-sm text-red-600">
                  The city is required
                </div>
              </div>
              <div>
                <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Postal Code *</label>
                <input
                  type="text"
                  id="postalCode"
                  formControlName="postalCode"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                  [placeholder]="'checkout.postalCode' | translate"
                >
                <div *ngIf="shippingForm.get('postalCode')?.invalid && shippingForm.get('postalCode')?.touched" class="mt-1 text-sm text-red-600">
                  The postal code is required
                </div>
              </div>
              <div>
                <label for="country" class="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">Country *</label>
                <select
                  id="country"
                  formControlName="country"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans']"
                >
                  <option value="">Select country</option>
                  <option value="IT">Italy</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="ES">Spain</option>
                </select>
                <div *ngIf="shippingForm.get('country')?.invalid && shippingForm.get('country')?.touched" class="mt-1 text-sm text-red-600">
                  Select a country
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Options -->
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-[#324053] mb-4 font-['Poppins']">Shipping Options</h3>
          <div class="space-y-3">
            <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="shippingOption"
                value="standard"
                formControlName="shippingOption"
                class="text-[#0ACF83] focus:ring-[#0ACF83]"
              >
              <div class="ml-3 flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-[#324053] font-['DM_Sans']">Standard Shipping</span>
                  <span class="font-semibold text-[#324053] font-['DM_Sans']">Free</span>
                </div>
                <p class="text-sm text-gray-600 font-['DM_Sans']">5-7 working days</p>
              </div>
            </label>
            <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="shippingOption"
                value="express"
                formControlName="shippingOption"
                class="text-[#0ACF83] focus:ring-[#0ACF83]"
              >
              <div class="ml-3 flex-1">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-[#324053] font-['DM_Sans']">Express Shipping</span>
                  <span class="font-semibold text-[#324053] font-['DM_Sans']">€15.00</span>
                </div>
                <p class="text-sm text-gray-600 font-['DM_Sans']">2-3 working days</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button"
            (click)="goBack()"
            class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium font-['DM_Sans']"
          >
          {{ 'checkout.backStep' | translate }}  {{ 'checkout.step1' | translate }}
          </button>
          <button 
            type="submit"
            [disabled]="shippingForm.invalid"
            class="flex-1 px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors font-semibold font-['DM_Sans'] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ 'checkout.nextStep' | translate }} {{ 'checkout.step3' | translate }}
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
export class ShippingComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  shippingForm: FormGroup;

  constructor() {
    this.shippingForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      shippingOption: ['standard', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.shippingForm.valid) {
      // Save shipping information
      console.log('Shipping form data:', this.shippingForm.value);
      this.router.navigate(['/checkout/payment']);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.shippingForm.controls).forEach(key => {
        this.shippingForm.get(key)?.markAsTouched();
      });
    }
  }

  goBack() {
    this.router.navigate(['/checkout/order-review']);
  }
} 