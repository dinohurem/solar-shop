import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DeleteConfirmationModalComponent],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-['Poppins']">
            Company Management
          </h1>
          <p class="text-gray-600 mt-1 font-['DM_Sans']">
            Manage partner company applications and approvals
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-solar-600"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select [(ngModel)]="selectedStatus" (ngModelChange)="onFilterChange()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <!-- Business Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select [(ngModel)]="selectedBusinessType" (ngModelChange)="onFilterChange()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">All Types</option>
              <option value="retailer">Retailer</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="installer">Installer</option>
              <option value="distributor">Distributor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input [(ngModel)]="searchTerm" (ngModelChange)="onFilterChange()" 
                   type="text" placeholder="Search companies..."
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select [(ngModel)]="selectedDateRange" (ngModelChange)="onFilterChange()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Companies</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending Approval</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Approved Companies</p>
              <p class="text-2xl font-bold text-gray-900">{{ approvedCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rejected Companies</p>
              <p class="text-2xl font-bold text-gray-900">{{ rejectedCompanies$ | async }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Companies Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 font-['Poppins']">
            Company Applications
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let company of filteredCompanies$ | async" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ company.companyName }}</div>
                    <div class="text-sm text-gray-500">{{ company.taxNumber }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ company.contactPersonName }}</div>
                    <div class="text-sm text-gray-500">{{ company.companyEmail }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getBusinessTypeClass(company.businessType)">
                    {{ getBusinessTypeLabel(company.businessType) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(company.status)">
                    {{ getStatusLabel(company.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(company.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button (click)="viewCompany(company)" 
                            class="text-solar-600 hover:text-solar-900">
                      View
                    </button>
                    <button *ngIf="company.status === 'pending'" 
                            (click)="approveCompany(company)" 
                            [disabled]="approving$ | async"
                            class="text-green-600 hover:text-green-900 disabled:opacity-50">
                      Approve
                    </button>
                    <button *ngIf="company.status === 'pending'" 
                            (click)="rejectCompany(company)" 
                            [disabled]="rejecting$ | async"
                            class="text-red-600 hover:text-red-900 disabled:opacity-50">
                      Reject
                    </button>
                    <button (click)="editCompany(company)" 
                            class="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    <button (click)="deleteCompany(company)" 
                            [disabled]="deleting$ | async"
                            class="text-red-600 hover:text-red-900 disabled:opacity-50">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="(filteredCompanies$ | async)?.length === 0 && !(loading$ | async)" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p class="text-gray-600">No company applications match your current filters.</p>
        </div>
      </div>
    </div>

    <!-- Company Details Modal -->
    <div *ngIf="selectedCompany" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 font-['Poppins']">
              Company Details
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Company Information -->
          <div class="space-y-6">
            <!-- Basic Info -->
            <div>
              <h4 class="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Company Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tax Number</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.taxNumber }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Business Type</label>
                  <p class="mt-1 text-sm text-gray-900">{{ getBusinessTypeLabel(selectedCompany.businessType) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Years in Business</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.yearsInBusiness }} years</p>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div>
              <h4 class="text-md font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.contactPersonName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyEmail }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyPhone }}</p>
                </div>
                <div *ngIf="selectedCompany.website">
                  <label class="block text-sm font-medium text-gray-700">Website</label>
                  <p class="mt-1 text-sm text-gray-900">
                    <a [href]="selectedCompany.website" target="_blank" class="text-solar-600 hover:text-solar-700">
                      {{ selectedCompany.website }}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <!-- Address -->
            <div>
              <h4 class="text-md font-semibold text-gray-900 mb-3">Address</h4>
              <p class="text-sm text-gray-900">{{ selectedCompany.companyAddress }}</p>
            </div>

            <!-- Business Details -->
            <div *ngIf="selectedCompany.annualRevenue || selectedCompany.numberOfEmployees || selectedCompany.description">
              <h4 class="text-md font-semibold text-gray-900 mb-3">Business Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngIf="selectedCompany.annualRevenue">
                  <label class="block text-sm font-medium text-gray-700">Annual Revenue</label>
                  <p class="mt-1 text-sm text-gray-900">€{{ selectedCompany.annualRevenue | number }}</p>
                </div>
                <div *ngIf="selectedCompany.numberOfEmployees">
                  <label class="block text-sm font-medium text-gray-700">Number of Employees</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.numberOfEmployees }}</p>
                </div>
              </div>
              <div *ngIf="selectedCompany.description" class="mt-4">
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.description }}</p>
              </div>
            </div>

            <!-- Status and Actions -->
            <div class="border-t pt-4">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-sm font-medium text-gray-700">Current Status: </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(selectedCompany.status)">
                    {{ getStatusLabel(selectedCompany.status) }}
                  </span>
                </div>
                <div class="flex space-x-2">
                  <button *ngIf="selectedCompany.status === 'pending'" 
                          (click)="approveCompany(selectedCompany)" 
                          [disabled]="approving$ | async"
                          class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                    Approve
                  </button>
                  <button *ngIf="selectedCompany.status === 'pending'" 
                          (click)="rejectCompany(selectedCompany)" 
                          [disabled]="rejecting$ | async"
                          class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>        </div>
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
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && confirm(`Are you sure you want to reject ${company.companyName}?`)) {
      this.store.dispatch(CompaniesActions.rejectCompany({ companyId: company.id, reason }));

      // Close modal if it's open
      if (this.selectedCompany?.id === company.id) {
        this.closeModal();
      }
    }
  }

  editCompany(company: Company): void {
    // TODO: Navigate to edit form or open edit modal
    console.log('Edit company:', company);
  }
  deleteCompany(company: Company): void {
    this.pendingDeleteCompany = company;
    this.deleteModalTitle = 'Confirm Deletion';
    this.deleteModalMessage = `Are you sure you want to delete ${company.companyName}? This action cannot be undone.`;
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