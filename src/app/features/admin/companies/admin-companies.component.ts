import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Company } from '../../../shared/models/company.model';
import { DeleteConfirmationModalComponent } from '../../../shared/components/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import * as CompaniesActions from './store/companies.actions';
import {
  selectFilteredCompanies,
  selectCompaniesLoading,
  selectCompaniesError,
  selectTotalCompanies,
  selectPendingCompanies,
  selectApprovedCompanies,
  selectRejectedCompanies,
  selectCompaniesApproving,
  selectCompaniesRejecting,
  selectCompaniesDeleting
} from './store/companies.selectors';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DeleteConfirmationModalComponent, TranslatePipe],
  template: `
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ 'admin.companiesForm.title' | translate }}
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ 'admin.companiesForm.subtitle' | translate }}
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div *ngIf="!(loading$ | async)" class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <!-- Status Filter -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              {{ 'admin.companiesForm.status' | translate }}
            </label>
            <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()" 
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">{{ 'admin.companiesForm.allStatuses' | translate }}</option>
              <option value="pending">{{ 'admin.companiesForm.pending' | translate }}</option>
              <option value="approved">{{ 'admin.companiesForm.approved' | translate }}</option>
              <option value="rejected">{{ 'admin.companiesForm.rejected' | translate }}</option>
            </select>
          </div>

          <!-- Business Type Filter -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              {{ 'admin.companiesForm.businessType' | translate }}
            </label>
            <select [(ngModel)]="selectedBusinessType" (ngModelChange)="onFilterChange()" 
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">{{ 'admin.companiesForm.allTypes' | translate }}</option>
              <option value="retailer">{{ 'admin.companiesForm.retailer' | translate }}</option>
              <option value="wholesaler">{{ 'admin.companiesForm.wholesaler' | translate }}</option>
              <option value="installer">{{ 'admin.companiesForm.installer' | translate }}</option>
              <option value="distributor">{{ 'admin.companiesForm.distributor' | translate }}</option>
              <option value="other">{{ 'admin.companiesForm.other' | translate }}</option>
            </select>
          </div>

          <!-- Search -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              {{ 'admin.companiesForm.search' | translate }}
            </label>
            <input [(ngModel)]="searchTerm" (ngModelChange)="onFilterChange()" 
                   type="text" placeholder="{{ 'admin.companiesForm.searchPlaceholder' | translate }}"
                   class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              {{ 'admin.companiesForm.dateRange' | translate }}
            </label>
            <select [(ngModel)]="selectedDateRange" (ngModelChange)="onFilterChange()" 
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">{{ 'admin.companiesForm.allDates' | translate }}</option>
              <option value="today">{{ 'admin.companiesForm.today' | translate }}</option>
              <option value="week">{{ 'admin.companiesForm.thisWeek' | translate }}</option>
              <option value="month">{{ 'admin.companiesForm.thisMonth' | translate }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div *ngIf="!(loading$ | async)" class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium text-gray-500">{{ 'admin.companiesForm.totalCompanies' | translate }}</p>
              <p class="text-lg font-bold text-gray-900">{{ totalCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium text-gray-500">{{ 'admin.companiesForm.pendingApproval' | translate }}</p>
              <p class="text-lg font-bold text-gray-900">{{ pendingCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium text-gray-500">{{ 'admin.companiesForm.approvedCompanies' | translate }}</p>
              <p class="text-lg font-bold text-gray-900">{{ approvedCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium text-gray-500">{{ 'admin.companiesForm.rejectedCompanies' | translate }}</p>
              <p class="text-lg font-bold text-gray-900">{{ rejectedCompanies$ | async }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-solar-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <!-- Companies Table -->
      <div *ngIf="!(loading$ | async)" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-4 py-2 border-b border-gray-200">
          <h3 class="text-base font-medium text-gray-900 font-['Poppins']">
            {{ 'admin.companiesForm.companyApplications' | translate }}
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companiesForm.company' | translate }}
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companiesForm.contactPerson' | translate }}
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companiesForm.businessType' | translate }}
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companiesForm.status' | translate }}
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companiesForm.appliedDate' | translate }}
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ 'admin.companiesForm.actions' | translate }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let company of filteredCompanies$ | async" class="hover:bg-gray-50">
                <td class="px-4 py-2 whitespace-nowrap">
                  <div>
                    <div class="text-xs font-medium text-gray-900">{{ company.companyName }}</div>
                    <div class="text-xs text-gray-500">{{ company.taxNumber }}</div>
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <div>
                    <div class="text-xs font-medium text-gray-900">{{ company.contactPersonName }}</div>
                    <div class="text-xs text-gray-500">{{ company.companyEmail }}</div>
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="getBusinessTypeClass(company.businessType)">
                    {{ getBusinessTypeLabel(company.businessType) }}
                  </span>
                </td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(company.status)">
                    {{ getStatusLabel(company.status) }}
                  </span>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                  {{ formatDate(company.createdAt) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-xs font-medium">
                  <div class="flex space-x-2">
                    <button (click)="viewCompany(company)" 
                            class="text-solar-600 hover:text-solar-900">
                      {{ 'admin.companiesForm.view' | translate }}
                    </button>
                    <button *ngIf="company.status === 'pending'" 
                            (click)="approveCompany(company)" 
                            [disabled]="approving$ | async"
                            class="text-green-600 hover:text-green-900 disabled:opacity-50">
                      {{ 'admin.companiesForm.approve' | translate }}
                    </button>
                    <button *ngIf="company.status === 'pending'" 
                            (click)="rejectCompany(company)" 
                            [disabled]="rejecting$ | async"
                            class="text-red-600 hover:text-red-900 disabled:opacity-50">
                      {{ 'admin.companiesForm.reject' | translate }}
                    </button>
                    <button (click)="editCompany(company)" 
                            class="text-blue-600 hover:text-blue-900">
                      {{ 'admin.companiesForm.edit' | translate }}
                    </button>
                    <button (click)="deleteCompany(company)" 
                            [disabled]="deleting$ | async"
                            class="text-red-600 hover:text-red-900 disabled:opacity-50">
                      {{ 'admin.companiesForm.delete' | translate }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="(filteredCompanies$ | async)?.length === 0 && !(loading$ | async)" class="text-center py-8">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <h3 class="text-base font-medium text-gray-900 mb-1">{{ 'admin.companiesForm.noCompaniesFound' | translate }}</h3>
          <p class="text-sm text-gray-600">{{ 'admin.companiesForm.noCompaniesFoundDescription' | translate }}</p>
        </div>
      </div>
    </div>

    <!-- Company Details Modal -->
    <div *ngIf="selectedCompany" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-4 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div class="mt-2">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-base font-medium text-gray-900 font-['Poppins']">
              {{ 'admin.companiesForm.companyDetails' | translate }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Company Information -->
          <div class="space-y-4">
            <!-- Basic Info -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-2">{{ 'admin.companiesForm.basicInformation' | translate }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.companyName' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">{{ selectedCompany.companyName }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.taxNumber' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">{{ selectedCompany.taxNumber }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.businessType' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">{{ getBusinessTypeLabel(selectedCompany.businessType) }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.yearsInBusiness' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">{{ selectedCompany.yearsInBusiness }} years</p>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-2">{{ 'admin.companiesForm.contactInformation' | translate }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.contactPerson' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">{{ selectedCompany.contactPersonName }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.email' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">{{ selectedCompany.companyEmail }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.phone' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">{{ selectedCompany.companyPhone }}</p>
                </div>
                <div *ngIf="selectedCompany.website">
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.website' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">
                    <a [href]="selectedCompany.website" target="_blank" class="text-solar-600 hover:text-solar-700">
                      {{ selectedCompany.website }}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <!-- Address -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-2">{{ 'admin.companiesForm.address' | translate }}</h4>
              <p class="text-xs text-gray-900">{{ selectedCompany.companyAddress }}</p>
            </div>

            <!-- Business Details -->
            <div *ngIf="selectedCompany.annualRevenue || selectedCompany.numberOfEmployees || selectedCompany.description">
              <h4 class="text-sm font-semibold text-gray-900 mb-2">{{ 'admin.companiesForm.businessDetails' | translate }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div *ngIf="selectedCompany.annualRevenue">
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.annualRevenue' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">€{{ selectedCompany.annualRevenue | number }}</p>
                </div>
                <div *ngIf="selectedCompany.numberOfEmployees">
                  <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.numberOfEmployees' | translate }}</label>
                  <p class="mt-1 text-xs text-gray-900">{{ selectedCompany.numberOfEmployees }}</p>
                </div>
              </div>
              <div *ngIf="selectedCompany.description" class="mt-3">
                <label class="block text-xs font-medium text-gray-700">{{ 'admin.companiesForm.description' | translate }}</label>
                <p class="mt-1 text-xs text-gray-900">{{ selectedCompany.description }}</p>
              </div>
            </div>

            <!-- Status and Actions -->
            <div class="border-t pt-3">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-xs font-medium text-gray-700">{{ 'admin.companiesForm.currentStatus' | translate }}: </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(selectedCompany.status)">
                    {{ getStatusLabel(selectedCompany.status) }}
                  </span>
                </div>
                <div class="flex space-x-2">
                  <button *ngIf="selectedCompany.status === 'pending'" 
                          (click)="approveCompany(selectedCompany)" 
                          [disabled]="approving$ | async"
                          class="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50">
                    {{ 'admin.companiesForm.approve' | translate }}
                  </button>
                  <button *ngIf="selectedCompany.status === 'pending'" 
                          (click)="rejectCompany(selectedCompany)" 
                          [disabled]="rejecting$ | async"
                          class="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50">
                    {{ 'admin.companiesForm.reject' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <app-delete-confirmation-modal
      [isOpen]="showDeleteModal"
      [title]="deleteModalTitle"
      [message]="deleteModalMessage"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="onDeleteCancelled()"
    ></app-delete-confirmation-modal>
  `,
})
export class AdminCompaniesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private translationService = inject(TranslationService);

  // Observables
  filteredCompanies$: Observable<Company[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  totalCompanies$: Observable<number>;
  pendingCompanies$: Observable<number>;
  approvedCompanies$: Observable<number>;
  rejectedCompanies$: Observable<number>;
  approving$: Observable<boolean>;
  rejecting$: Observable<boolean>;
  deleting$: Observable<boolean>;
  selectedCompany: Company | null = null;

  // Delete modal properties
  showDeleteModal = false;
  deleteModalTitle = '';
  deleteModalMessage = '';
  pendingDeleteCompany: Company | null = null;

  // Filters
  selectedStatus = '';
  selectedBusinessType = '';
  searchTerm = '';
  selectedDateRange = '';

  constructor(private store: Store) {
    // Initialize observables
    this.filteredCompanies$ = this.store.select(selectFilteredCompanies);
    this.loading$ = this.store.select(selectCompaniesLoading);
    this.error$ = this.store.select(selectCompaniesError);
    this.totalCompanies$ = this.store.select(selectTotalCompanies);
    this.pendingCompanies$ = this.store.select(selectPendingCompanies);
    this.approvedCompanies$ = this.store.select(selectApprovedCompanies);
    this.rejectedCompanies$ = this.store.select(selectRejectedCompanies);
    this.approving$ = this.store.select(selectCompaniesApproving);
    this.rejecting$ = this.store.select(selectCompaniesRejecting);
    this.deleting$ = this.store.select(selectCompaniesDeleting);
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCompanies(): void {
    this.store.dispatch(CompaniesActions.loadCompanies());
  }

  onFilterChange(): void {
    this.store.dispatch(CompaniesActions.setFilters({
      status: this.selectedStatus || undefined,
      businessType: this.selectedBusinessType || undefined,
      searchTerm: this.searchTerm || undefined,
      dateRange: this.selectedDateRange || undefined
    }));
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  getBusinessTypeClass(type: string): string {
    switch (type) {
      case 'retailer':
        return 'bg-blue-100 text-blue-800';
      case 'wholesaler':
        return 'bg-purple-100 text-purple-800';
      case 'installer':
        return 'bg-green-100 text-green-800';
      case 'distributor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getBusinessTypeLabel(type: string): string {
    switch (type) {
      case 'retailer':
        return 'Retailer';
      case 'wholesaler':
        return 'Wholesaler';
      case 'installer':
        return 'Installer';
      case 'distributor':
        return 'Distributor';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewCompany(company: Company): void {
    this.selectedCompany = company;
  }

  closeModal(): void {
    this.selectedCompany = null;
  }

  approveCompany(company: Company): void {
    if (confirm(`Are you sure you want to approve ${company.companyName}?`)) {
      this.store.dispatch(CompaniesActions.approveCompany({ companyId: company.id }));

      // Close modal if it's open
      if (this.selectedCompany?.id === company.id) {
        this.closeModal();
      }
    }
  }

  rejectCompany(company: Company): void {
    const reason = prompt(this.translationService.translate('admin.companiesForm.reasonForRejection'));
    if (reason && confirm(this.translationService.translate('admin.companiesForm.confirmRejectionMessage', { companyName: company.companyName }))) {
      this.store.dispatch(CompaniesActions.rejectCompany({ companyId: company.id, reason }));

      // Close modal if it's open
      if (this.selectedCompany?.id === company.id) {
        this.closeModal();
      }
    }
  }

  editCompany(company: Company): void {
    // TODO: Navigate to edit form or open edit modal
  }
  deleteCompany(company: Company): void {
    this.pendingDeleteCompany = company;
    this.deleteModalTitle = this.translationService.translate('admin.companiesForm.confirmDeletion');
    this.deleteModalMessage = this.translationService.translate('admin.companiesForm.confirmDeletionMessage', { companyName: company.companyName });
    this.showDeleteModal = true;
  }

  onDeleteConfirmed(): void {
    if (this.pendingDeleteCompany) {
      this.store.dispatch(CompaniesActions.deleteCompany({ companyId: this.pendingDeleteCompany.id }));

      // Close modal if it's open
      if (this.selectedCompany?.id === this.pendingDeleteCompany.id) {
        this.closeModal();
      }

      this.onDeleteCancelled(); // Reset state
    }
  }

  onDeleteCancelled(): void {
    this.showDeleteModal = false;
    this.pendingDeleteCompany = null;
    this.deleteModalTitle = '';
    this.deleteModalMessage = '';
  }
}