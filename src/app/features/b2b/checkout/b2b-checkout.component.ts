import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-b2b-checkout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Progress Steps -->
        <div class="mb-8">
          <nav aria-label="Progress">
            <ol class="flex items-center justify-center space-x-8">
              <!-- Step 1: Order Review -->
              <li class="flex items-center">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                       [class]="getStepClass(1)">
                    <svg *ngIf="currentStep > 1" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span *ngIf="currentStep <= 1">1</span>
                  </div>
                  <span class="text-sm font-medium transition-colors" [class]="getStepTextClass(1)">{{ 'b2bCheckout.step1' | translate }}</span>
                </div>
                <div class="ml-8 w-8 h-0.5 transition-colors" [class]="getConnectorClass(1)"></div>
              </li>
              
              <!-- Step 2: Shipping -->
              <li class="flex items-center">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                       [class]="getStepClass(2)">
                    <svg *ngIf="currentStep > 2" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span *ngIf="currentStep <= 2">2</span>
                  </div>
                  <span class="text-sm font-medium transition-colors" [class]="getStepTextClass(2)">{{ 'b2bCheckout.step2' | translate }}</span>
                </div>
                <div class="ml-8 w-8 h-0.5 transition-colors" [class]="getConnectorClass(2)"></div>
              </li>
              
              <!-- Step 3: Payment -->
              <li class="flex items-center">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                       [class]="getStepClass(3)">
                    <svg *ngIf="currentStep > 3" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <span *ngIf="currentStep <= 3">3</span>
                  </div>
                  <span class="text-sm font-medium transition-colors" [class]="getStepTextClass(3)">{{ 'b2bCheckout.step3' | translate }}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <!-- Checkout Content -->
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    
    
  `]
})
export class B2bCheckoutComponent implements OnInit, OnDestroy {
  currentStep = 1;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Listen to route changes to update current step
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      console.log('B2B Checkout: Navigation to:', event.url);
      this.updateCurrentStep(event.url);
      this.cdr.detectChanges();
    });

    // Set initial step based on current URL
    this.updateCurrentStep(this.router.url);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateCurrentStep(url: string): void {
    console.log('B2B Checkout: Updating step for URL:', url);

    let newStep = 1; // Default to step 1

    if (url.includes('/order-review') || url.endsWith('/checkout') || url.includes('/b2b-checkout')) {
      newStep = 1;
    } else if (url.includes('/shipping')) {
      newStep = 2;
    } else if (url.includes('/payment')) {
      newStep = 3;
    }

    if (this.currentStep !== newStep) {
      console.log('B2B Checkout: Step changed from', this.currentStep, 'to', newStep);
      this.currentStep = newStep;
    }
  }

  getStepClass(step: number): string {
    if (this.currentStep > step) {
      return 'bg-green-600 text-white'; // Completed
    } else if (this.currentStep === step) {
      return 'bg-solar-600 text-white'; // Current
    } else {
      return 'bg-gray-300 text-gray-600'; // Upcoming
    }
  }

  getStepTextClass(step: number): string {
    if (this.currentStep > step) {
      return 'text-green-600'; // Completed
    } else if (this.currentStep === step) {
      return 'text-solar-600'; // Current
    } else {
      return 'text-gray-600'; // Upcoming
    }
  }

  getConnectorClass(step: number): string {
    if (this.currentStep > step) {
      return 'bg-green-600'; // Completed
    } else {
      return 'bg-gray-300'; // Not completed
    }
  }
} 