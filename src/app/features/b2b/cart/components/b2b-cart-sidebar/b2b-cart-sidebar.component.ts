import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { B2BCartItem, B2BCartSummary } from '../../models/b2b-cart.model';
import * as B2BCartSelectors from '../../store/b2b-cart.selectors';
import * as B2BCartActions from '../../store/b2b-cart.actions';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-b2b-cart-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    template: `
    <div class="fixed inset-0 z-50 overflow-hidden" [class.hidden]="!isOpen">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50" (click)="closeSidebar()"></div>
      
      <!-- Sidebar -->
      <div class="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300"
           [class.translate-x-full]="!isOpen">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ 'b2bCart.title' | translate }}
          </h2>
          <button (click)="closeSidebar()" 
                  class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          
          <!-- Loading State -->
          <div *ngIf="loading$ | async" class="flex items-center justify-center p-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Empty Cart -->
          <div *ngIf="(isEmpty$ | async) && !(loading$ | async)" class="p-6 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 6h16l2 12H8l-2-8H4zm16 0l2 8h8l2-8m-8 8v8m0 0l-4-4m4 4l4-4"/>
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">
              {{ 'b2bCart.emptyTitle' | translate }}
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              {{ 'b2bCart.emptyMessage' | translate }}
            </p>
            <button (click)="closeSidebar()" 
                    class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              {{ 'b2bCart.continueShopping' | translate }}
            </button>
          </div>

          <!-- Cart Items -->
          <div *ngIf="!(isEmpty$ | async) && !(loading$ | async)">
            
            <!-- Company Info -->
            <div *ngIf="companyInfo$ | async as company" class="p-4 bg-blue-50 border-b">
              <div class="text-sm text-blue-800">
                <span class="font-medium">{{ 'b2bCart.orderingFor' | translate }}:</span> 
                {{ company.companyName }}
              </div>
            </div>

            <!-- Items List -->
            <div class="divide-y divide-gray-200">
              <div *ngFor="let item of cartItems$ | async; trackBy: trackByProductId" 
                   class="p-4 hover:bg-gray-50 transition-colors">
                
                <div class="flex space-x-3">
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img [src]="item.imageUrl" [alt]="item.name" 
                         class="h-16 w-16 rounded-md object-cover border">
                  </div>

                  <!-- Product Info -->
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</h4>
                    <p class="text-xs text-gray-500">{{ 'b2bCart.sku' | translate }}: {{ item.sku }}</p>
                    
                    <!-- Pricing -->
                    <div class="mt-1 space-y-1">
                      <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-green-600">€{{ item.unitPrice }}</span>
                        <span *ngIf="item.retailPrice > item.unitPrice" 
                              class="text-xs text-gray-400 line-through">€{{ item.retailPrice }}</span>
                        <span *ngIf="item.savings > 0" 
                              class="text-xs text-green-600 font-medium">
                          {{ 'b2bCart.save' | translate }} €{{ item.savings / item.quantity }}
                        </span>
                      </div>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="mt-2 flex items-center space-x-2">
                      <button (click)="decreaseQuantity(item.productId)" 
                              [disabled]="item.quantity <= 1"
                              class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm 
                                     hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        -
                      </button>
                      <span class="text-sm font-medium min-w-[2rem] text-center">{{ item.quantity }}</span>
                      <button (click)="increaseQuantity(item.productId)" 
                              class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm 
                                     hover:bg-gray-300 transition-colors">
                        +
                      </button>
                      <span class="text-xs text-gray-500 ml-2">
                        = €{{ item.totalPrice }}
                      </span>
                    </div>
                  </div>

                  <!-- Remove Button -->
                  <div class="flex-shrink-0">
                    <button (click)="removeItem(item.productId)" 
                            class="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div *ngIf="cartSummary$ | async as summary" class="p-4 border-t bg-gray-50">
              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>{{ 'b2bCart.subtotal' | translate }}</span>
                  <span>€{{ summary.subtotal }}</span>
                </div>
                <div *ngIf="summary.totalSavings > 0" class="flex justify-between text-sm text-green-600">
                  <span>{{ 'b2bCart.totalSavings' | translate }}</span>
                  <span>-€{{ summary.totalSavings }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-500">
                  <span>{{ 'b2bCart.estimatedTax' | translate }}</span>
                  <span>€{{ summary.estimatedTax }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-500">
                  <span>{{ 'b2bCart.shipping' | translate }}</span>
                  <span>{{ summary.estimatedShipping === 0 ? ('b2bCart.freeShipping' | translate) : '€' + summary.estimatedShipping }}</span>
                </div>
                <div class="border-t pt-2 flex justify-between font-medium">
                  <span>{{ 'b2bCart.total' | translate }}</span>
                  <span>€{{ summary.total }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-4 space-y-2">
                <button [routerLink]="['/partners/checkout']" (click)="closeSidebar()"
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                               transition-colors font-medium">
                  {{ 'b2bCart.proceedToCheckout' | translate }}
                </button>
                <button (click)="clearCart()" 
                        class="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 
                               transition-colors text-sm">
                  {{ 'b2bCart.clearCart' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      position: relative;
      z-index: 1000;
    }
  `]
})
export class B2BCartSidebarComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    isOpen = false;

    // Observables
    cartItems$: Observable<B2BCartItem[]>;
    cartSummary$: Observable<B2BCartSummary>;
    loading$: Observable<boolean>;
    isEmpty$: Observable<boolean>;
    companyInfo$: Observable<{ companyId: string | null; companyName: string | null }>;

    constructor(private store: Store) {
        this.cartItems$ = this.store.select(B2BCartSelectors.selectB2BCartItems);
        this.cartSummary$ = this.store.select(B2BCartSelectors.selectB2BCartSummary);
        this.loading$ = this.store.select(B2BCartSelectors.selectB2BCartLoading);
        this.isEmpty$ = this.store.select(B2BCartSelectors.selectB2BCartIsEmpty);
        this.companyInfo$ = this.store.select(B2BCartSelectors.selectB2BCartCompanyInfo);
    }

    ngOnInit(): void {
        // Auto-close sidebar when route changes (optional)
        // this.router.events.pipe(
        //   filter(event => event instanceof NavigationEnd),
        //   takeUntil(this.destroy$)
        // ).subscribe(() => {
        //   this.closeSidebar();
        // });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openSidebar(): void {
        this.isOpen = true;
    }

    closeSidebar(): void {
        this.isOpen = false;
    }

    toggleSidebar(): void {
        this.isOpen = !this.isOpen;
    }

    increaseQuantity(productId: string): void {
        // Get current quantity and increase by 1
        this.store.select(B2BCartSelectors.selectB2BCartItemQuantity(productId))
            .pipe(takeUntil(this.destroy$))
            .subscribe(currentQuantity => {
                this.store.dispatch(B2BCartActions.updateB2BCartItem({
                    productId,
                    quantity: currentQuantity + 1
                }));
            });
    }

    decreaseQuantity(productId: string): void {
        // Get current quantity and decrease by 1 (minimum 1)
        this.store.select(B2BCartSelectors.selectB2BCartItemQuantity(productId))
            .pipe(takeUntil(this.destroy$))
            .subscribe(currentQuantity => {
                if (currentQuantity > 1) {
                    this.store.dispatch(B2BCartActions.updateB2BCartItem({
                        productId,
                        quantity: currentQuantity - 1
                    }));
                }
            });
    }

    removeItem(productId: string): void {
        this.store.dispatch(B2BCartActions.removeFromB2BCart({ productId }));
    }

    clearCart(): void {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.store.dispatch(B2BCartActions.clearB2BCart());
        }
    }

    trackByProductId(index: number, item: B2BCartItem): string {
        return item.productId;
    }
} 