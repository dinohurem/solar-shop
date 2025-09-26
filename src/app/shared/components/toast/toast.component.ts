import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div 
        *ngFor="let toast of toasts$ | async; trackBy: trackByToastId"
        class="min-w-80 px-4 py-3 rounded-lg shadow-lg border flex items-center space-x-3 transition-all duration-300 ease-in-out bg-white"
        [ngClass]="{
          'border-green-200 text-green-800': toast.type === 'success',
          'border-red-200 text-red-800': toast.type === 'error',
          'border-yellow-200 text-yellow-800': toast.type === 'warning',
          'border-blue-200 text-blue-800': toast.type === 'info',
          'border-purple-200 text-purple-800': toast.type === 'loading'
        }"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <!-- Success Icon -->
          <svg 
            *ngIf="toast.type === 'success'" 
            class="w-5 h-5 text-green-600" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fill-rule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clip-rule="evenodd"
            />
          </svg>
          
          <!-- Error Icon -->
          <svg 
            *ngIf="toast.type === 'error'" 
            class="w-5 h-5 text-red-600" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fill-rule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clip-rule="evenodd"
            />
          </svg>
          
          <!-- Warning Icon -->
          <svg 
            *ngIf="toast.type === 'warning'" 
            class="w-5 h-5 text-yellow-600" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fill-rule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clip-rule="evenodd"
            />
          </svg>
          
          <!-- Info Icon -->
          <svg
            *ngIf="toast.type === 'info'"
            class="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- Loading Icon -->
          <svg
            *ngIf="toast.type === 'loading'"
            class="w-5 h-5 text-purple-600 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        
        <!-- Message and Progress -->
        <div class="flex-1">
          <div class="font-medium text-sm">
            {{ toast.message }}
          </div>

          <!-- Progress Bar for Loading Toast -->
          <div *ngIf="toast.type === 'loading' && toast.progress !== undefined" class="mt-2">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                [style.width.%]="toast.progress"
              ></div>
            </div>
            <div class="text-xs text-gray-500 mt-1">{{ toast.progress }}%</div>
          </div>
        </div>

        <!-- Close Button (only show if showCloseButton is true) -->
        <button
          *ngIf="toast.showCloseButton !== false"
          (click)="closeToast(toast.id)"
          class="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    
    :host {
      font-family: 'DM Sans', sans-serif;
    }
  `]
})
export class ToastComponent {
    private toastService = inject(ToastService);

    toasts$: Observable<Toast[]> = this.toastService.toasts$;

    trackByToastId(index: number, toast: Toast): string {
        return toast.id;
    }

    closeToast(id: string): void {
        this.toastService.removeToast(id);
    }
} 