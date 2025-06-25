import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Company } from '../../../models/company.model';

@Component({
    selector: 'app-company-approval-modal',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onBackdropClick($event)"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
      
      <!-- Modal Container -->
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div 
          class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          (click)="$event.stopPropagation()"
        >
          <!-- Icon -->
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <!-- Content -->
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
              {{ 'admin.companiesForm.confirmApprovalTitle' | translate }}
            </h3>
            <div class="mt-2">
                             <p class="text-sm text-gray-500">
                 {{ 'admin.companiesForm.confirmApprovalMessage' | translate }} 
                 <span class="font-medium text-gray-900">{{ company?.companyName }}</span>?
               </p>
               <div *ngIf="company" class="mt-4 bg-gray-50 rounded-lg p-4 text-left">
                 <div class="space-y-2 text-sm">
                   <div>
                     <span class="font-medium text-gray-700">{{ 'admin.companiesForm.companyName' | translate }}:</span>
                     <span class="ml-2 text-gray-900">{{ company.companyName }}</span>
                   </div>
                   <div>
                     <span class="font-medium text-gray-700">{{ 'admin.companiesForm.companyEmail' | translate }}:</span>
                     <span class="ml-2 text-gray-900">{{ company.companyEmail }}</span>
                   </div>
                   <div *ngIf="company.businessType">
                     <span class="font-medium text-gray-700">{{ 'admin.companiesForm.businessType' | translate }}:</span>
                     <span class="ml-2 text-gray-900">{{ company.businessType }}</span>
                   </div>
                </div>
              </div>
              <div class="mt-4">
                <p class="text-sm text-gray-600">
                  {{ 'admin.companiesForm.approvalNote' | translate }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:col-start-2"
              (click)="onApprove()"
            >
              {{ 'admin.companiesForm.approveCompany' | translate }}
            </button>
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              (click)="onCancel()"
            >
              {{ 'common.cancel' | translate }}
            </button>
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
export class CompanyApprovalModalComponent {
    @Input() isOpen: boolean = false;
    @Input() company: Company | null = null;

    @Output() approved = new EventEmitter<Company>();
    @Output() cancelled = new EventEmitter<void>();

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onCancel();
        }
    }

    onApprove(): void {
        if (this.company) {
            this.approved.emit(this.company);
        }
    }

    onCancel(): void {
        this.cancelled.emit();
    }
} 