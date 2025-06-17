import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CompanyRegistrationData } from '../../../../shared/models/company.model';
import { PartnerRegistrationService } from '../services/partner-registration.service';

@Component({
    selector: 'app-partners-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
    template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
            {{ 'partnersRegister.title' | translate }}
          </h1>
          <p class="mt-2 text-lg text-gray-600 font-['DM_Sans']">
            {{ 'partnersRegister.subtitle' | translate }}
          </p>
        </div>

        <!-- Progress Steps -->
        <div class="mb-8">
          <div class="flex items-center justify-center">
            <div class="flex items-center">
              <!-- Step 1 -->
              <div class="flex items-center">
                <div [class]="currentStep === 1 ? 'bg-solar-600 text-white' : (currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600')" 
                     class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                  <span *ngIf="currentStep <= 1">1</span>
                  <svg *ngIf="currentStep > 1" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class="ml-2 text-sm font-medium text-gray-900">{{ 'partnersRegister.step1' | translate }}</span>
              </div>
              
              <!-- Connector -->
              <div class="w-16 h-0.5 mx-4" [class]="currentStep > 1 ? 'bg-green-600' : 'bg-gray-300'"></div>
              
              <!-- Step 2 -->
              <div class="flex items-center">
                <div [class]="currentStep === 2 ? 'bg-solar-600 text-white' : (currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600')" 
                     class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                  <span *ngIf="currentStep <= 2">2</span>
                  <svg *ngIf="currentStep > 2" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <span class="ml-2 text-sm font-medium text-gray-900">{{ 'partnersRegister.step2' | translate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <form [formGroup]="registrationForm" (ngSubmit)="onSubmit()">
            
            <!-- Step 1: Personal Information -->
            <div *ngIf="currentStep === 1">
              <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">
                {{ 'partnersRegister.personalInfo' | translate }}
              </h2>
              
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
                  <input formControlName="phoneNumber" type="tel" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'register.enterPhone' | translate">
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'register.address' | translate }}
                  </label>
                  <textarea formControlName="address" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                            [placeholder]="'register.enterAddress' | translate"></textarea>
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'register.password' | translate }}*
                  </label>
                  <input formControlName="password" type="password" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'register.createPassword' | translate">
                  <div *ngIf="isFieldInvalid('password')" class="mt-1 text-sm text-red-600">
                    {{ 'register.passwordRequired' | translate }}
                  </div>
                </div>

                <!-- Confirm Password -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'register.confirmPassword' | translate }}*
                  </label>
                  <input formControlName="confirmPassword" type="password" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'register.confirmYourPassword' | translate">
                  <div *ngIf="isFieldInvalid('confirmPassword')" class="mt-1 text-sm text-red-600">
                    {{ 'register.passwordMismatch' | translate }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Company Information -->
            <div *ngIf="currentStep === 2">
              <h2 class="text-xl font-semibold text-gray-900 mb-6 font-['Poppins']">
                {{ 'partnersRegister.companyInfo' | translate }}
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Company Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.companyName' | translate }}*
                  </label>
                  <input formControlName="companyName" type="text" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'partnersRegister.enterCompanyName' | translate">
                  <div *ngIf="isFieldInvalid('companyName')" class="mt-1 text-sm text-red-600">
                    {{ 'partnersRegister.companyNameRequired' | translate }}
                  </div>
                </div>

                <!-- Tax Number -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.taxNumber' | translate }}*
                  </label>
                  <input formControlName="taxNumber" type="text" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'partnersRegister.enterTaxNumber' | translate">
                  <div *ngIf="isFieldInvalid('taxNumber')" class="mt-1 text-sm text-red-600">
                    {{ 'partnersRegister.taxNumberRequired' | translate }}
                  </div>
                </div>

                <!-- Company Address -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.companyAddress' | translate }}*
                  </label>
                  <textarea formControlName="companyAddress" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                            [placeholder]="'partnersRegister.enterCompanyAddress' | translate"></textarea>
                  <div *ngIf="isFieldInvalid('companyAddress')" class="mt-1 text-sm text-red-600">
                    {{ 'partnersRegister.companyAddressRequired' | translate }}
                  </div>
                </div>

                <!-- Company Phone -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.companyPhone' | translate }}*
                  </label>
                  <input formControlName="companyPhone" type="tel" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'partnersRegister.enterCompanyPhone' | translate">
                  <div *ngIf="isFieldInvalid('companyPhone')" class="mt-1 text-sm text-red-600">
                    {{ 'partnersRegister.companyPhoneRequired' | translate }}
                  </div>
                </div>

                <!-- Company Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.companyEmail' | translate }}*
                  </label>
                  <input formControlName="companyEmail" type="email" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'partnersRegister.enterCompanyEmail' | translate">
                  <div *ngIf="isFieldInvalid('companyEmail')" class="mt-1 text-sm text-red-600">
                    {{ 'partnersRegister.companyEmailRequired' | translate }}
                  </div>
                </div>

                <!-- Website -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.website' | translate }}
                  </label>
                  <input formControlName="website" type="url" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'partnersRegister.enterWebsite' | translate">
                </div>

                <!-- Business Type -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.businessType' | translate }}*
                  </label>
                  <select formControlName="businessType" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent">
                    <option value="">{{ 'partnersRegister.selectBusinessType' | translate }}</option>
                    <option value="retailer">{{ 'partnersRegister.retailer' | translate }}</option>
                    <option value="wholesaler">{{ 'partnersRegister.wholesaler' | translate }}</option>
                    <option value="installer">{{ 'partnersRegister.installer' | translate }}</option>
                    <option value="distributor">{{ 'partnersRegister.distributor' | translate }}</option>
                    <option value="other">{{ 'partnersRegister.other' | translate }}</option>
                  </select>
                  <div *ngIf="isFieldInvalid('businessType')" class="mt-1 text-sm text-red-600">
                    {{ 'partnersRegister.businessTypeRequired' | translate }}
                  </div>
                </div>

                <!-- Years in Business -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.yearsInBusiness' | translate }}*
                  </label>
                  <input formControlName="yearsInBusiness" type="number" min="0" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'partnersRegister.enterYearsInBusiness' | translate">
                  <div *ngIf="isFieldInvalid('yearsInBusiness')" class="mt-1 text-sm text-red-600">
                    {{ 'partnersRegister.yearsInBusinessRequired' | translate }}
                  </div>
                </div>

                <!-- Annual Revenue -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.annualRevenue' | translate }}
                  </label>
                  <input formControlName="annualRevenue" type="number" min="0" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'partnersRegister.enterAnnualRevenue' | translate">
                </div>

                <!-- Number of Employees -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.numberOfEmployees' | translate }}
                  </label>
                  <input formControlName="numberOfEmployees" type="number" min="0" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                         [placeholder]="'partnersRegister.enterNumberOfEmployees' | translate">
                </div>

                <!-- Description -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ 'partnersRegister.description' | translate }}
                  </label>
                  <textarea formControlName="description" rows="4"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
                            [placeholder]="'partnersRegister.descriptionPlaceholder' | translate"></textarea>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div *ngIf="currentStep === 3" class="text-center py-12">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ 'partnersRegister.applicationSubmitted' | translate }}</h2>
              <p class="text-gray-600 mb-6">{{ 'partnersRegister.applicationMessage' | translate }}</p>
              <button (click)="router.navigate(['/'])" 
                      class="bg-solar-600 text-white px-6 py-3 rounded-lg hover:bg-solar-700 transition-colors">
                {{ 'forgotPassword.backToHome' | translate }}
              </button>
            </div>

            <!-- Form Actions -->
            <div *ngIf="currentStep < 3" class="flex justify-between mt-8">
              <button *ngIf="currentStep > 1" type="button" (click)="previousStep()"
                      class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                {{ 'partnersRegister.previousStep' | translate }}
              </button>
              <div *ngIf="currentStep === 1"></div>
              
              <button *ngIf="currentStep === 1" type="button" (click)="nextStep()"
                      [disabled]="!isStep1Valid()"
                      class="px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                {{ 'partnersRegister.nextStep' | translate }}
              </button>
              
              <button *ngIf="currentStep === 2" type="submit" 
                      [disabled]="!registrationForm.valid || isSubmitting"
                      class="px-6 py-3 bg-solar-600 text-white rounded-lg hover:bg-solar-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                <span *ngIf="!isSubmitting">{{ 'partnersRegister.submitApplication' | translate }}</span>
                <span *ngIf="isSubmitting">{{ 'partnersRegister.submittingApplication' | translate }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class PartnersRegisterComponent {
    currentStep = 1;
    isSubmitting = false;
    registrationForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        public router: Router,
        private registrationService: PartnerRegistrationService
    ) {
        this.registrationForm = this.fb.group({
            // Personal Information
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: [''],
            address: [''],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],

            // Company Information
            companyName: ['', [Validators.required]],
            taxNumber: ['', [Validators.required]],
            companyAddress: ['', [Validators.required]],
            companyPhone: ['', [Validators.required]],
            companyEmail: ['', [Validators.required, Validators.email]],
            website: [''],
            businessType: ['', [Validators.required]],
            yearsInBusiness: ['', [Validators.required, Validators.min(0)]],
            annualRevenue: [''],
            numberOfEmployees: [''],
            description: ['']
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        if (confirmPassword?.errors?.['passwordMismatch']) {
            delete confirmPassword.errors['passwordMismatch'];
            if (Object.keys(confirmPassword.errors).length === 0) {
                confirmPassword.setErrors(null);
            }
        }

        return null;
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.registrationForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    isStep1Valid(): boolean {
        const step1Fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
        return step1Fields.every(field => {
            const control = this.registrationForm.get(field);
            return control && control.valid;
        });
    }

    nextStep(): void {
        if (this.isStep1Valid()) {
            this.currentStep = 2;
        } else {
            // Mark step 1 fields as touched to show validation errors
            const step1Fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
            step1Fields.forEach(field => {
                this.registrationForm.get(field)?.markAsTouched();
            });
        }
    }

    previousStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    onSubmit(): void {
        if (this.registrationForm.valid) {
            this.isSubmitting = true;

            const formData = this.registrationForm.value as CompanyRegistrationData;

            this.registrationService.registerPartner(formData).then(result => {
                this.isSubmitting = false;
                if (!result.error) {
                    this.currentStep = 3;
                } else {
                    console.error('Partner registration failed:', result.error);
                }
            });
        } else {
            // Mark all fields as touched to show validation errors
            this.registrationForm.markAllAsTouched();
        }
    }
}
