import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as CartSelectors from '../cart/store/cart.selectors';
import * as CartActions from '../cart/store/cart.actions';
import { CartItem, CartSummary } from '../../../shared/models/cart.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">{{ 'checkout.title' | translate }}</h1>
          <p class="mt-2 text-gray-600 font-['DM_Sans']">{{ 'checkout.completeOrder' | translate }}</p>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center space-x-8">
            <!-- Step 1: Order Review -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center justify-center w-8 h-8 rounded-full" 
                   [ngClass]="{
                     'bg-solar-600 text-white': currentStep >= 1,
                     'border-2 border-gray-300 bg-white text-gray-400': currentStep < 1
                   }">
                <svg *ngIf="currentStep > 1" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span *ngIf="currentStep <= 1" class="text-sm font-semibold">1</span>
              </div>
              <span class="text-sm font-medium font-['DM_Sans']" 
                    [ngClass]="{
                      'text-solar-600': currentStep >= 1,
                      'text-gray-400': currentStep < 1
                    }">{{ 'checkout.step1' | translate }}</span>
            </div>

            <!-- Connector Line -->
            <div class="w-16 h-px" [ngClass]="{
              'bg-solar-600': currentStep > 1,
              'bg-gray-300': currentStep <= 1
            }"></div>

            <!-- Step 2: Shipping -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center justify-center w-8 h-8 rounded-full" 
                   [ngClass]="{
                     'bg-solar-600 text-white': currentStep >= 2,
                     'border-2 border-gray-300 bg-white text-gray-400': currentStep < 2
                   }">
                <svg *ngIf="currentStep > 2" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span *ngIf="currentStep <= 2" class="text-sm font-semibold">2</span>
              </div>
              <span class="text-sm font-medium font-['DM_Sans']" 
                    [ngClass]="{
                      'text-solar-600': currentStep >= 2,
                      'text-gray-400': currentStep < 2
                    }">{{ 'checkout.step2' | translate }}</span>
            </div>

            <!-- Connector Line -->
            <div class="w-16 h-px" [ngClass]="{
              'bg-solar-600': currentStep > 2,
              'bg-gray-300': currentStep <= 2
            }"></div>

            <!-- Step 3: Payment -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center justify-center w-8 h-8 rounded-full" 
                   [ngClass]="{
                     'bg-solar-600 text-white': currentStep >= 3,
                     'border-2 border-gray-300 bg-white text-gray-400': currentStep < 3
                   }">
                <svg *ngIf="currentStep > 3" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span *ngIf="currentStep <= 3" class="text-sm font-semibold">3</span>
              </div>
              <span class="text-sm font-medium font-['DM_Sans']" 
                    [ngClass]="{
                      'text-solar-600': currentStep >= 3,
                      'text-gray-400': currentStep < 3
                    }">{{ 'checkout.step3' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Checkout Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2">
            <router-outlet></router-outlet>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 font-['Poppins']">{{ 'checkout.orderSummary' | translate }}</h3>
              
              <!-- Cart Items -->
              <div class="space-y-4 mb-6">
                <div 
                  *ngFor="let item of cartItems$ | async; trackBy: trackByItemId"
                  class="flex items-center space-x-3"
                >
                  <img 
                    [src]="item.image" 
                    [alt]="item.name"
                    class="w-12 h-12 object-cover rounded-lg bg-gray-100"
                  >
                  <div class="flex-1 min-w-0">
                    <a 
                      [routerLink]="['/proizvodi', item.productId || item.id]"
                      class="text-sm font-medium text-gray-900 hover:text-solar-600 truncate block cursor-pointer font-['DM_Sans']"
                    >
                      {{ item.name }}
                    </a>
                    <p class="text-sm text-gray-500 font-['DM_Sans']">x{{ item.quantity }}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-medium text-gray-900 font-['DM_Sans'] block">
                      {{ (item.price * item.quantity) | currency:'EUR':'symbol':'1.2-2' }}
                    </span>
                    <span 
                      *ngIf="item.offerOriginalPrice && item.offerOriginalPrice > item.price"
                      class="text-xs text-gray-500 line-through font-['DM_Sans'] block"
                    >
                      {{ ((item.offerOriginalPrice || item.price) * item.quantity) | currency:'EUR':'symbol':'1.2-2' }}
                    </span>
                    <span 
                      *ngIf="item.offerSavings && item.offerSavings > 0"
                      class="text-xs text-green-600 font-medium font-['DM_Sans'] block"
                    >
                      {{ 'cart.saveFromOffer' | translate }}:
                      <ng-container *ngIf="item.offerType === 'percentage'">
                        {{ item.offerDiscount }}% OFF ({{ item.offerSavings | currency:'EUR':'symbol':'1.2-2' }})
                      </ng-container>
                      <ng-container *ngIf="item.offerType === 'fixed_amount'">
                        {{ item.offerSavings | currency:'EUR':'symbol':'1.2-2' }} OFF
                      </ng-container>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-200 mb-4"></div>

              <!-- Summary -->
              <ng-container *ngIf="cartSummary$ | async as summary">
                <div class="space-y-2 text-sm mb-4">
                  <div class="flex justify-between">
                    <span class="text-gray-600 font-['DM_Sans']">{{ 'checkout.subtotal' | translate }}</span>
                    <span class="font-['DM_Sans']">{{ summary.subtotal | currency:'EUR':'symbol':'1.2-2' }}</span>
                  </div>
                  <div 
                    *ngIf="summary.discount && summary.discount > 0"
                    class="flex justify-between text-green-600"
                  >
                    <span class="font-['DM_Sans']">{{ 'cart.discount' | translate }}</span>
                    <span class="font-['DM_Sans']">-{{ summary.discount | currency:'EUR':'symbol':'1.2-2' }}</span>
                  </div>
                </div>

                <!-- Divider -->
                <div class="border-t border-gray-200 mb-4"></div>

                <!-- Total -->
                <div class="flex justify-between text-lg font-semibold">
                  <span class="font-['DM_Sans']">{{ 'checkout.total' | translate }}</span>
                  <span class="font-['DM_Sans']">{{ summary.total | currency:'EUR':'symbol':'1.2-2' }}</span>
                </div>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class CheckoutComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  cartItems$: Observable<CartItem[]>;
  cartSummary$: Observable<CartSummary | null>;
  currentStep = 1;

  constructor() {
    this.cartItems$ = this.store.select(CartSelectors.selectCartItems);
    this.cartSummary$ = this.store.select(CartSelectors.selectCartSummary);
  }

  ngOnInit() {
    // Cart is already loaded by the cart sidebar in the page layout
    // No need to dispatch loadCart here as it would be redundant

    // Check if cart is empty and redirect if needed
    this.store.select(CartSelectors.selectIsCartEmpty).subscribe(isEmpty => {
      if (isEmpty) {
        this.router.navigate(['/proizvodi']);
      }
    });

    // Update current step based on route
    this.updateCurrentStep();

    // Listen to route changes to update step
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentStep();
    });
  }

  private updateCurrentStep() {
    const url = this.router.url;
    if (url.includes('/blagajna/pregled-narudzbe')) {
      this.currentStep = 1;
    } else if (url.includes('/blagajna/dostava')) {
      this.currentStep = 2;
    } else if (url.includes('/blagajna/placanje')) {
      this.currentStep = 3;
    }
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }
} 
