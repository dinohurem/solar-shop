import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-success-modal',
    standalone: true,
    imports: [CommonModule],
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
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          
          <!-- Content -->
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
              {{ title || 'Success!' }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ message || 'Operation completed successfully.' }}
              </p>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="mt-5 sm:mt-6">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              (click)="onClose()"
            >
              {{ closeText || 'OK' }}
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
export class SuccessModalComponent {
    @Input() isOpen: boolean = false;
    @Input() title?: string;
    @Input() message?: string;
    @Input() closeText?: string;

    @Output() closed = new EventEmitter<void>();

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onClose();
        }
    }

    onClose(): void {
        this.closed.emit();
    }
}
