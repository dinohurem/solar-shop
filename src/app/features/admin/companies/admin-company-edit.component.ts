import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter, map, debounceTime, distinctUntilChanged, switchMap, first } from 'rxjs/operators';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Company } from '../../../shared/models/company.model';
import { SupabaseService } from '../../../services/supabase.service';
import * as CompaniesActions from './store/companies.actions';
import {
  selectCompaniesLoading,
  selectCompaniesError,
  selectCompanyById
} from './store/companies.selectors';

@Component({
  selector: 'app-admin-company-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditMode ? ('admin.companiesForm.editCompany' | translate) : ('admin.companiesForm.createCompany' | translate) }}
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ isEditMode ? ('admin.companiesForm.editCompanySubtitle' | translate) : ('admin.companiesForm.createCompanySubtitle' | translate) }}
          </p>
        </div>
        <div class="flex space-x-3">
          <button
            type="button"
            (click)="goBack()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            {{ 'common.cancel' | translate }}
          </button>
          <button
            type="button"
            (click)="saveCompany()"
            [disabled]="companyForm.invalid || (loading$ | async)"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="loading$ | async" class="inline-flex items-center">
              <svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ 'common.saving' | translate }}
            </span>
            <span *ngIf="!(loading$ | async)">{{ 'common.save' | translate }}</span>
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <!-- Form -->
      <div class="bg-white shadow-sm rounded-xl border border-gray-100">
        <form [formGroup]="companyForm" (ngSubmit)="saveCompany()" class="p-6 space-y-8">
          
          <!-- Basic Information -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              {{ 'admin.companiesForm.basicInformation' | translate }}
            </h3>
            
            <!-- Company UUID (only shown in edit mode) -->
            <div *ngIf="isEditMode && companyId" class="mb-6">
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Company ID (UUID)
                </label>
                <div class="flex items-center">
                  <input
                    type="text"
                    [value]="companyId"
                    readonly
                    class="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600 cursor-not-allowed"
                  >
                  <button
                    type="button"
                    (click)="copyToClipboard(companyId)"
                    class="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                    title="Copy UUID">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Company Name -->
              <div>
                <label for="companyName" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.companyName' | translate }} *
                </label>
                <input
                  type="text"
                  id="companyName"
                  formControlName="companyName"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.companyName' | translate">
                <div *ngIf="companyForm.get('companyName')?.invalid && companyForm.get('companyName')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'validation.required' | translate }}
                </div>
              </div>

              <!-- Tax Number -->
              <div>
                <label for="taxNumber" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.taxNumber' | translate }} *
                </label>
                <input
                  type="text"
                  id="taxNumber"
                  formControlName="taxNumber"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.taxNumber' | translate">
                <div *ngIf="companyForm.get('taxNumber')?.invalid && companyForm.get('taxNumber')?.touched" class="mt-1 text-sm text-red-600">
                  <span *ngIf="companyForm.get('taxNumber')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
                  <span *ngIf="companyForm.get('taxNumber')?.errors?.['taxNumberExists']">{{ 'validation.taxNumberExists' | translate }}</span>
                </div>
                <div *ngIf="companyForm.get('taxNumber')?.pending" class="mt-1 text-sm text-gray-500">
                  Provjera OIB-a...
                </div>
              </div>

              <!-- Business Type -->
              <div>
                <label for="businessType" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.businessType' | translate }} *
                </label>
                <select
                  id="businessType"
                  formControlName="businessType"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">{{ 'admin.companiesForm.selectBusinessType' | translate }}</option>
                  <option value="retailer">{{ 'admin.companiesForm.retailer' | translate }}</option>
                  <option value="wholesaler">{{ 'admin.companiesForm.wholesaler' | translate }}</option>
                  <option value="installer">{{ 'admin.companiesForm.installer' | translate }}</option>
                  <option value="distributor">{{ 'admin.companiesForm.distributor' | translate }}</option>
                  <option value="other">{{ 'admin.companiesForm.other' | translate }}</option>
                </select>
                <div *ngIf="companyForm.get('businessType')?.invalid && companyForm.get('businessType')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'validation.required' | translate }}
                </div>
              </div>

              <!-- Years in Business -->
              <div>
                <label for="yearsInBusiness" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.yearsInBusiness' | translate }} *
                </label>
                <input
                  type="number"
                  id="yearsInBusiness"
                  formControlName="yearsInBusiness"
                  min="0"
                  max="100"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.yearsInBusiness' | translate">
                <div *ngIf="companyForm.get('yearsInBusiness')?.invalid && companyForm.get('yearsInBusiness')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'validation.required' | translate }}
                </div>
              </div>

              <!-- Number of Employees -->
              <div>
                <label for="numberOfEmployees" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.numberOfEmployees' | translate }}
                </label>
                <input
                  type="number"
                  id="numberOfEmployees"
                  formControlName="numberOfEmployees"
                  min="1"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.numberOfEmployees' | translate">
              </div>

              <!-- Annual Revenue -->
              <div>
                <label for="annualRevenue" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.annualRevenue' | translate }}
                </label>
                <input
                  type="number"
                  id="annualRevenue"
                  formControlName="annualRevenue"
                  min="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.annualRevenue' | translate">
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ 'admin.companiesForm.contactInformation' | translate }}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Contact Person Name -->
              <div>
                <label for="contactPersonName" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.contactPerson' | translate }} *
                </label>
                <input
                  type="text"
                  id="contactPersonName"
                  formControlName="contactPersonName"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.contactPerson' | translate">
                <div *ngIf="companyForm.get('contactPersonName')?.invalid && companyForm.get('contactPersonName')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'validation.required' | translate }}
                </div>
              </div>

              <!-- Company Email -->
              <div>
                <label for="companyEmail" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.companyEmail' | translate }} *
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  formControlName="companyEmail"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.companyEmail' | translate">
                <div *ngIf="companyForm.get('companyEmail')?.invalid && companyForm.get('companyEmail')?.touched" class="mt-1 text-sm text-red-600">
                  <span *ngIf="companyForm.get('companyEmail')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
                  <span *ngIf="companyForm.get('companyEmail')?.errors?.['email']">{{ 'validation.invalidEmail' | translate }}</span>
                </div>
              </div>

              <!-- Company Phone -->
              <div>
                <label for="companyPhone" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.companyPhone' | translate }} *
                </label>
                <input
                  type="tel"
                  id="companyPhone"
                  formControlName="companyPhone"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.companyPhone' | translate">
                <div *ngIf="companyForm.get('companyPhone')?.invalid && companyForm.get('companyPhone')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'validation.required' | translate }}
                </div>
              </div>

              <!-- Website -->
              <div>
                <label for="website" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ 'admin.companiesForm.website' | translate }}
                </label>
                <input
                  type="url"
                  id="website"
                  formControlName="website"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [placeholder]="'admin.companiesForm.website' | translate">
                <div *ngIf="companyForm.get('website')?.invalid && companyForm.get('website')?.touched" class="mt-1 text-sm text-red-600">
                  {{ 'validation.invalidUrl' | translate }}
                </div>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ 'admin.companiesForm.address' | translate }}
            </h3>
            
            <!-- Company Address -->
            <div>
              <label for="companyAddress" class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'admin.companiesForm.companyAddress' | translate }} *
              </label>
              <textarea
                id="companyAddress"
                formControlName="companyAddress"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [placeholder]="'admin.companiesForm.companyAddress' | translate"></textarea>
              <div *ngIf="companyForm.get('companyAddress')?.invalid && companyForm.get('companyAddress')?.touched" class="mt-1 text-sm text-red-600">
                {{ 'validation.required' | translate }}
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {{ 'admin.companiesForm.description' | translate }}
            </h3>
            
            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'admin.companiesForm.description' | translate }}
              </label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [placeholder]="'admin.companiesForm.description' | translate"></textarea>
            </div>
          </div>

          <!-- Status (Only for edit mode) -->
          <div *ngIf="isEditMode">
            <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ 'admin.companiesForm.status' | translate }}
            </h3>
            
            <!-- Status -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'admin.companiesForm.status' | translate }}
              </label>
              <select
                id="status"
                formControlName="status"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="pending">{{ 'admin.companiesForm.pending' | translate }}</option>
                <option value="approved">{{ 'admin.companiesForm.approved' | translate }}</option>
                <option value="rejected">{{ 'admin.companiesForm.rejected' | translate }}</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminCompanyEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private destroy$ = new Subject<void>();

  companyForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  isEditMode = false;
  companyId: string | null = null;

  constructor() {
    this.loading$ = this.store.select(selectCompaniesLoading);
    this.error$ = this.store.select(selectCompaniesError);

    this.companyForm = this.fb.group({
      companyName: ['', [Validators.required]],
      taxNumber: ['', [Validators.required], [this.taxNumberValidator()]],
      businessType: ['', [Validators.required]],
      yearsInBusiness: [null, [Validators.required, Validators.min(0)]],
      numberOfEmployees: [null],
      annualRevenue: [null],
      contactPersonName: ['', [Validators.required]],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPhone: ['', [Validators.required]],
      website: [''],
      companyAddress: ['', [Validators.required]],
      description: [''],
      status: ['pending'],
      // Fields for contact person creation (only for new companies)
      firstName: [''],
      lastName: [''],
      email: [''],
      phoneNumber: ['']
    });
  }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.companyId;

    if (this.isEditMode && this.companyId) {
      // Load company data for editing
      this.store.dispatch(CompaniesActions.loadCompanies());

      this.store.select(selectCompanyById(this.companyId))
        .pipe(
          filter(company => !!company),
          takeUntil(this.destroy$)
        )
        .subscribe(company => {
          if (company) {
            this.populateForm(company);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private populateForm(company: Company): void {
    this.companyForm.patchValue({
      companyName: company.companyName,
      taxNumber: company.taxNumber,
      businessType: company.businessType,
      yearsInBusiness: company.yearsInBusiness,
      numberOfEmployees: company.numberOfEmployees,
      annualRevenue: company.annualRevenue,
      contactPersonName: company.contactPersonName,
      companyEmail: company.companyEmail,
      companyPhone: company.companyPhone,
      website: company.website,
      companyAddress: company.companyAddress,
      description: company.description,
      status: company.status
    });
  }

  saveCompany(): void {
    if (this.companyForm.valid) {
      const formData = this.companyForm.value;

      if (this.isEditMode && this.companyId) {
        // Update existing company
        this.store.dispatch(CompaniesActions.updateCompany({
          companyId: this.companyId,
          company: formData
        }));
      } else {
        // Create new company
        this.store.dispatch(CompaniesActions.createCompany({
          company: formData
        }));
      }

      // Navigate back after action is dispatched
      // The effects will handle success/error states
      this.goBack();
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.companyForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/tvrtke']);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // You could show a toast notification here if you have one
      console.log('Company UUID copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy Company UUID: ', err);
    });
  }

  /**
   * Async validator to check if tax number already exists
   */
  private taxNumberValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return new Observable(observer => {
          observer.next(null);
          observer.complete();
        });
      }

      return control.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(() => {
          // If editing, check if tax number belongs to current company
          const taxNumberToCheck = control.value;

          return this.supabaseService.client
            .from('companies')
            .select('id, tax_number')
            .eq('tax_number', taxNumberToCheck)
            .then(({ data, error }) => {
              if (error) {
                console.error('Error checking tax number:', error);
                return null;
              }

              // If no company found with this tax number, it's available
              if (!data || data.length === 0) {
                return null;
              }

              // If editing and tax number belongs to current company, it's valid
              if (this.isEditMode && this.companyId && data[0].id === this.companyId) {
                return null;
              }

              // Tax number already exists for another company
              return { taxNumberExists: true };
            });
        }),
        first()
      );
    };
  }
}