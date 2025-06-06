import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
              <p class="mt-2 text-gray-600">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back
            </button>
          </div>
        </div>

        <!-- Form Container -->
        <div class="bg-white shadow rounded-lg">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 p-6">
            <!-- Dynamic Form Content -->
            <ng-content></ng-content>

            <!-- Form Actions -->
            <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                (click)="goBack()"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="form.invalid || isSubmitting"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-solar-600 hover:bg-solar-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-solar-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span *ngIf="!isSubmitting">{{ isEditMode ? 'Update' : 'Create' }}</span>
                <span *ngIf="isSubmitting" class="flex items-center">
                  <svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isEditMode ? 'Updating...' : 'Creating...' }}
                </span>
              </button>
            </div>
          </form>
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
export class AdminFormComponent {
    @Input() title!: string;
    @Input() subtitle!: string;
    @Input() form!: FormGroup;
    @Input() isEditMode = false;
    @Input() isSubmitting = false;
    @Input() backRoute!: string;

    @Output() formSubmit = new EventEmitter<any>();

    constructor(private router: Router) { }

    onSubmit(): void {
        if (this.form.valid) {
            this.formSubmit.emit(this.form.value);
        }
    }

    goBack(): void {
        this.router.navigate([this.backRoute]);
    }
} 