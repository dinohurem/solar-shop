import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-partners-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
            {{ 'b2b.contact.title' | translate }}
          </h1>
          <p class="mt-2 text-lg text-gray-600 font-['DM_Sans']">
            {{ 'b2b.contact.subtitle' | translate }}
          </p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <!-- Contact Information -->
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">
              {{ 'b2b.contact.getInTouch' | translate }}
            </h2>
            
            <div class="space-y-6">
              <!-- Partner Support -->
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.contact.partnerSupport' | translate }}
                  </h3>
                  <p class="text-gray-600 mb-2 font-['DM_Sans']">
                    {{ 'b2b.contact.partnerSupportText' | translate }}
                  </p>
                  <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                      <a href="tel:+385123456789" class="text-solar-600 hover:text-solar-700">{{ 'b2b.contact.phone' | translate }}</a>
                    </p>
                    <p class="text-sm text-gray-600">
                      <span class="font-medium">{{ 'b2b.contact.email' | translate }}: </span> 
                      <a href="mailto:partners@solarshop.hr" class="text-solar-600 hover:text-solar-700">{{ 'b2b.contact.supportEmail' | translate }}</a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Sales Team -->
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.contact.salesTeam' | translate }}
                  </h3>
                  <p class="text-gray-600 mb-2 font-['DM_Sans']">
                    {{ 'b2b.contact.salesTeamText' | translate }}
                  </p>
                  <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                      <a href="tel:+385123456790" class="text-solar-600 hover:text-solar-700">{{ 'b2b.contact.salesTeamPhone' | translate }}</a>
                    </p>
                    <p class="text-sm text-gray-600">
                      <span class="font-medium">{{ 'b2b.contact.email' | translate }}: </span> 
                      <a href="mailto:sales@solarshop.hr" class="text-solar-600 hover:text-solar-700">{{ 'b2b.contact.salesTeamEmail' | translate }}</a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Technical Support -->
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.contact.technicalSupport' | translate }}
                  </h3>
                  <p class="text-gray-600 mb-2 font-['DM_Sans']">
                    {{ 'b2b.contact.technicalSupportText' | translate }}
                  </p>
                  <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                      <a href="tel:+385123456791" class="text-solar-600 hover:text-solar-700"> {{ 'b2b.contact.technicalSupportPhone' | translate }}</a>
                    </p>
                    <p class="text-sm text-gray-600">
                      <span class="font-medium">{{ 'b2b.contact.email' | translate }}: </span> 
                      <a href="mailto:tech@solarshop.hr" class="text-solar-600 hover:text-solar-700">{{ 'b2b.contact.technicalSupportEmail' | translate }}</a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Office Address -->
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.contact.officeAddress' | translate }}
                  </h3>
                  <p class="text-gray-600 font-['DM_Sans']">
                    {{ 'b2b.contact.address' | translate }}
                  </p>
                </div>
              </div>

              <!-- Business Hours -->
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.contact.businessHours' | translate }}
                  </h3>
                  <div class="space-y-1 text-sm text-gray-600 font-['DM_Sans']">
                    <p>{{ 'b2b.contact.mondayFriday' | translate }}: 8:00 - 18:00</p>
                    <p>{{ 'b2b.contact.saturday' | translate }}: 9:00 - 14:00</p>
                    <p>{{ 'b2b.contact.sunday' | translate }}: {{ 'b2b.contact.closed' | translate }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div>
            <div class="bg-white rounded-lg shadow-lg p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'b2b.contact.sendMessage' | translate }}
              </h2>

              <!-- Success Message -->
              <div *ngIf="messageSent" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <p class="text-sm text-green-800 font-['DM_Sans']">
                    {{ 'b2b.contact.messageSent' | translate }}
                  </p>
                </div>
              </div>

              <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- First Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ 'register.firstName' | translate }}*
                    </label>
                    <input formControlName="firstName" type="text" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                           [placeholder]="'register.enterFirstName' | translate">
                    <div *ngIf="isFieldInvalid('firstName')" class="mt-1 text-sm text-red-600">
                      {{ 'register.firstNameRequired' | translate }}
                    </div>
                  </div>

                  <!-- Last Name -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ 'register.lastName' | translate }}*
                    </label>
                    <input formControlName="lastName" type="text" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                           [placeholder]="'register.enterLastName' | translate">
                    <div *ngIf="isFieldInvalid('lastName')" class="mt-1 text-sm text-red-600">
                      {{ 'register.lastNameRequired' | translate }}
                    </div>
                  </div>

                  <!-- Email -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ 'register.email' | translate }}*
                    </label>
                    <input formControlName="email" type="email" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                           [placeholder]="'register.enterEmail' | translate">
                    <div *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600">
                      {{ 'register.emailRequired' | translate }}
                    </div>
                  </div>

                  <!-- Phone -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ 'register.phoneNumber' | translate }}
                    </label>
                    <input formControlName="phone" type="tel" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                           [placeholder]="'register.enterPhone' | translate">
                  </div>

                  <!-- Company -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ 'partnersRegister.companyName' | translate }}
                    </label>
                    <input formControlName="company" type="text" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                           [placeholder]="'partnersRegister.enterCompanyName' | translate">
                  </div>

                  <!-- Subject -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      {{ 'b2b.contact.subject' | translate }}*
                    </label>
                    <select formControlName="subject" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent">
                      <option value="">{{ 'b2b.contact.selectSubject' | translate }}</option>
                      <option value="partnership">{{ 'b2b.contact.partnershipInquiry' | translate }}</option>
                      <option value="pricing">{{ 'b2b.contact.pricingInquiry' | translate }}</option>
                      <option value="pricingInquiry">{{ 'b2b.contact.productPricingInquiry' | translate }}</option>
                      <option value="technical">{{ 'b2b.contact.technicalSupport' | translate }}</option>
                      <option value="sales">{{ 'b2b.contact.salesInquiry' | translate }}</option>
                      <option value="other">{{ 'partnersRegister.other' | translate }}</option>
                    </select>
                    <div *ngIf="isFieldInvalid('subject')" class="mt-1 text-sm text-red-600">
                      {{ 'b2b.contact.subjectRequired' | translate }}
                    </div>
                  </div>

                  <!-- Product Information (shown for pricing inquiries) -->
                  <div *ngIf="contactForm.get('subject')?.value === 'pricingInquiry'" class="col-span-1 md:col-span-2">
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 class="text-sm font-medium text-yellow-800 mb-2">Product Information</h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
                        <div *ngIf="productName">
                          <span class="font-medium">Product:</span> {{ productName }}
                        </div>
                        <div *ngIf="productSku">
                          <span class="font-medium">SKU:</span> {{ productSku }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Message -->
                <div class="mt-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'b2b.contact.message' | translate }}*
                  </label>
                  <textarea formControlName="message" rows="6"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                            [placeholder]="'b2b.contact.messagePlaceholder' | translate"></textarea>
                  <div *ngIf="isFieldInvalid('message')" class="mt-1 text-sm text-red-600">
                    {{ 'b2b.contact.messageRequired' | translate }}
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="mt-6">
                  <button type="submit" 
                          [disabled]="contactForm.invalid || isSubmitting"
                          class="w-full bg-solar-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-solar-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                    <span *ngIf="!isSubmitting">{{ 'b2b.contact.sendMessage' | translate }}</span>
                    <span *ngIf="isSubmitting">{{ 'b2b.contact.sendingMessage' | translate }}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PartnersContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  messageSent = false;

  // Properties for product quote requests
  productId: string | null = null;
  productName: string | null = null;
  productSku: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Check for query parameters from product quote requests
    this.route.queryParams.subscribe(params => {
      if (params['subject'] === 'pricingInquiry') {
        this.contactForm.patchValue({
          subject: 'pricingInquiry'
        });

        // Set product information
        this.productId = params['productId'] || null;
        this.productName = params['productName'] || null;
        this.productSku = params['sku'] || null;

        // Pre-fill the message with product details
        if (this.productName && this.productSku) {
          const message = `I would like to request a quote for the following product:\n\nProduct: ${this.productName}\nSKU: ${this.productSku}\n\nPlease provide pricing information and availability.`;
          this.contactForm.patchValue({
            message: message
          });
        }
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const value = this.contactForm.value;
      this.supabase.createRecord('contacts', {
        first_name: value.firstName,
        last_name: value.lastName,
        email: value.email,
        phone: value.phone,
        company: value.company,
        subject: value.subject,
        message: value.message,
        is_newsletter: false
      }).then(() => {
        this.isSubmitting = false;
        this.messageSent = true;
        this.contactForm.reset();
        setTimeout(() => { this.messageSent = false; }, 5000);
      }).catch(error => {
        console.error('Error sending partner contact:', error);
        this.isSubmitting = false;
        alert('Error sending message');
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.contactForm.markAllAsTouched();
    }
  }
} 