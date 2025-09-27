import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Company } from '../../../shared/models/company.model';
import { DeleteConfirmationModalComponent } from '../../../shared/components/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { CompanyApprovalModalComponent } from '../../../shared/components/modals/company-approval-modal/company-approval-modal.component';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
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
import { AdminNotificationsService } from '../shared/services/admin-notifications.service';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DeleteConfirmationModalComponent, CompanyApprovalModalComponent, TranslatePipe, DataTableComponent],
  template: `
    <div class="space-y-6">
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

      <!-- Statistics Cards -->
      <div *ngIf="!(loading$ | async)" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ 'admin.companiesForm.totalCompanies' | translate }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ 'admin.companiesForm.pendingApproval' | translate }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ 'admin.companiesForm.approvedCompanies' | translate }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ approvedCompanies$ | async }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">{{ 'admin.companiesForm.rejectedCompanies' | translate }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ rejectedCompanies$ | async }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error$ | async as error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm">
        <app-data-table
          [title]="translationService.translate('admin.companiesForm.companyApplications')"
          [data]="(filteredCompanies$ | async) || []"
          [config]="tableConfig"
          [loading]="(loading$ | async) || false"
          (actionClicked)="onTableAction($event)"
          (addClicked)="onAddCompany()"
          (rowClicked)="onRowClick($event)">
        </app-data-table>
      </div>
    </div>

    <!-- Company Details Modal -->
    <div *ngIf="selectedCompany" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ 'admin.companiesForm.companyDetails' | translate }}
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
              <h4 class="text-sm font-semibold text-gray-900 mb-3">{{ 'admin.companiesForm.basicInformation' | translate }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.companyName' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.taxNumber' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.taxNumber }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.businessType' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ getBusinessTypeLabel(selectedCompany.businessType) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.yearsInBusiness' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.yearsInBusiness }} years</p>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div>
              <h4 class="text-sm font-semibold text-gray-900 mb-3">{{ 'admin.companiesForm.contactInformation' | translate }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.contactPerson' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.contactPersonName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.companyEmail' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyEmail }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.companyPhone' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyPhone }}</p>
                </div>
                <div *ngIf="selectedCompany.website">
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.website' | translate }}</label>
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
              <h4 class="text-sm font-semibold text-gray-900 mb-3">{{ 'admin.companiesForm.address' | translate }}</h4>
              <p class="text-sm text-gray-900">{{ selectedCompany.companyAddress }}</p>
            </div>

            <!-- Business Details -->
            <div *ngIf="selectedCompany.annualRevenue || selectedCompany.numberOfEmployees || selectedCompany.description">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">{{ 'admin.companiesForm.businessDetails' | translate }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngIf="selectedCompany.annualRevenue">
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.annualRevenue' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">€{{ selectedCompany.annualRevenue | number }}</p>
                </div>
                <div *ngIf="selectedCompany.numberOfEmployees">
                  <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.numberOfEmployees' | translate }}</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.numberOfEmployees }}</p>
                </div>
              </div>
              <div *ngIf="selectedCompany.description" class="mt-4">
                <label class="block text-sm font-medium text-gray-700">{{ 'admin.companiesForm.description' | translate }}</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.description }}</p>
              </div>
            </div>

            <!-- Status and Actions -->
            <div class="border-t pt-4">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-sm font-medium text-gray-700">{{ 'admin.companiesForm.currentStatus' | translate }}: </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(selectedCompany.status)">
                    {{ getStatusLabel(selectedCompany.status) }}
                  </span>
                </div>
                <div class="flex space-x-3">
                  <button *ngIf="selectedCompany.status === 'pending'" 
                          (click)="approveCompany(selectedCompany)" 
                          [disabled]="approving$ | async"
                          class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                    {{ 'admin.companiesForm.approve' | translate }}
                  </button>
                  <button *ngIf="selectedCompany.status === 'pending'" 
                          (click)="rejectCompany(selectedCompany)" 
                          [disabled]="rejecting$ | async"
                          class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
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

    <!-- Company Approval Modal -->
    <app-company-approval-modal
      [isOpen]="showApprovalModal"
      [company]="pendingApprovalCompany"
      (approved)="onApprovalConfirmed()"
      (cancelled)="onApprovalCancelled()"
    ></app-company-approval-modal>
  `,
})
export class AdminCompaniesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  translationService = inject(TranslationService);
  private notificationsService = inject(AdminNotificationsService);

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

  // Approval modal properties
  showApprovalModal = false;
  pendingApprovalCompany: Company | null = null;

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        key: 'companyName',
        label: this.translationService.translate('admin.companiesForm.company'),
        type: 'text',
        sortable: true,
        searchable: true
      },
      {
        key: 'contactPersonName',
        label: this.translationService.translate('admin.companiesForm.contactPerson'),
        type: 'text',
        sortable: true,
        searchable: true
      },
      {
        key: 'businessType',
        label: this.translationService.translate('admin.companiesForm.businessType'),
        type: 'status',
        sortable: true,
        format: (value) => this.getBusinessTypeLabel(value)
      },
      {
        key: 'status',
        label: this.translationService.translate('admin.companiesForm.status'),
        type: 'status',
        sortable: true,
        format: (value) => this.getStatusLabel(value)
      },
      {
        key: 'createdAt',
        label: this.translationService.translate('admin.companiesForm.appliedDate'),
        type: 'date',
        sortable: true,
        format: (value) => this.formatDate(value)
      }
    ],
    actions: [
      {
        label: this.translationService.translate('admin.companiesForm.view'),
        icon: 'eye',
        action: 'view',
        class: 'text-blue-600 hover:text-blue-900'
      },
      {
        label: this.translationService.translate('admin.companiesForm.approve'),
        icon: 'check',
        action: 'approve',
        class: 'text-green-600 hover:text-green-900',
        condition: (item: Company) => item.status === 'pending'
      },
      {
        label: this.translationService.translate('admin.companiesForm.reject'),
        icon: 'x',
        action: 'reject',
        class: 'text-orange-600 hover:text-orange-900',
        condition: (item: Company) => item.status === 'pending'
      },
      {
        label: this.translationService.translate('admin.companiesForm.edit'),
        icon: 'edit',
        action: 'edit',
        class: 'text-blue-600 hover:text-blue-900'
      },
      {
        label: this.translationService.translate('admin.companiesForm.delete'),
        icon: 'trash2',
        action: 'delete',
        class: 'text-red-600 hover:text-red-900'
      }
    ],
    searchable: true,
    sortable: true,
    paginated: true,
    pageSize: 20,
    allowCsvImport: false,
    allowExport: true,
    rowClickable: true
  };

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

    // Mark companies section as viewed to clear notification badge
    this.notificationsService.markSectionAsViewed('companies');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCompanies(): void {
    this.store.dispatch(CompaniesActions.loadCompanies());
  }

  onTableAction(event: { action: string, item: Company }): void {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.viewCompany(item);
        break;
      case 'approve':
        this.approveCompany(item);
        break;
      case 'reject':
        this.rejectCompany(item);
        break;
      case 'edit':
        this.editCompany(item);
        break;
      case 'delete':
        this.deleteCompany(item);
        break;
    }
  }

  onAddCompany(): void {
    this.router.navigate(['/admin/tvrtke/kreiraj']);
  }

  onRowClick(company: Company): void {
    this.viewCompany(company);
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
    const statusMap: { [key: string]: string } = {
      'pending': this.translationService.translate('admin.companiesForm.pending'),
      'approved': this.translationService.translate('admin.companiesForm.approved'),
      'rejected': this.translationService.translate('admin.companiesForm.rejected')
    };
    return statusMap[status] || status;
  }

  getBusinessTypeClass(type: string): string {
    switch (type) {
      case 'retailer':
        return 'bg-blue-100 text-blue-800';
      case 'wholesaler':
        return 'bg-green-100 text-green-800';
      case 'installer':
        return 'bg-purple-100 text-purple-800';
      case 'distributor':
        return 'bg-orange-100 text-orange-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getBusinessTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'retailer': this.translationService.translate('admin.companiesForm.retailer'),
      'wholesaler': this.translationService.translate('admin.companiesForm.wholesaler'),
      'installer': this.translationService.translate('admin.companiesForm.installer'),
      'distributor': this.translationService.translate('admin.companiesForm.distributor'),
      'other': this.translationService.translate('admin.companiesForm.other')
    };
    return typeMap[type] || type;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  viewCompany(company: Company): void {
    this.selectedCompany = company;
  }

  closeModal(): void {
    this.selectedCompany = null;
  }

  approveCompany(company: Company): void {
    this.pendingApprovalCompany = company;
    this.showApprovalModal = true;
  }

  rejectCompany(company: Company): void {
    const reason = prompt(this.translationService.translate('admin.companiesForm.reasonForRejection'));
    if (reason) {
      this.store.dispatch(CompaniesActions.rejectCompany({
        companyId: company.id,
        reason: reason
      }));
      this.closeModal();
    }
  }

  editCompany(company: Company): void {
    this.router.navigate(['/admin/tvrtke/uredi', company.id]);
  }

  deleteCompany(company: Company): void {
    this.deleteModalTitle = this.translationService.translate('admin.companiesForm.confirmDeletion');
    this.deleteModalMessage = this.translationService.translate('admin.companiesForm.confirmDeletionMessage');
    this.pendingDeleteCompany = company;
    this.showDeleteModal = true;
  }

  onDeleteConfirmed(): void {
    if (this.pendingDeleteCompany) {
      this.store.dispatch(CompaniesActions.deleteCompany({
        companyId: this.pendingDeleteCompany.id
      }));
      this.pendingDeleteCompany = null;
      this.showDeleteModal = false;
      this.closeModal();
    }
  }

  onDeleteCancelled(): void {
    this.pendingDeleteCompany = null;
    this.showDeleteModal = false;
  }

  onApprovalConfirmed(): void {
    if (this.pendingApprovalCompany) {
      this.store.dispatch(CompaniesActions.approveCompany({
        companyId: this.pendingApprovalCompany.id
      }));
      this.pendingApprovalCompany = null;
      this.showApprovalModal = false;
      this.closeModal();
    }
  }

  onApprovalCancelled(): void {
    this.pendingApprovalCompany = null;
    this.showApprovalModal = false;
  }
}