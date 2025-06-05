import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, delay, distinctUntilChanged } from 'rxjs';
import * as CartSelectors from '../../store/cart.selectors';
import { TranslatePipe } from "../../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-cart-notification',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div 
      *ngIf="showNotification"
      class="fixed top-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 cart-notification"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span>{{ 'cart.itemAddedToCart' | translate }}</span>
    </div>
  `,
  styles: [`
    .cart-notification {
      animation: slideInDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform, opacity;
      backface-visibility: hidden;
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translate3d(0, -100%, 0);
      }
      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
    }
  `]
})
export class CartNotificationComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  showNotification = false;
  private previousItemCount = 0;
  private notificationTimeout?: number;

  constructor() {
    // Watch for cart item count changes with better debouncing
    this.store.select(CartSelectors.selectCartItemCount)
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        filter(count => count !== null && count !== undefined)
      )
      .subscribe(count => {
        // Only show notification if count actually increased
        if (count > this.previousItemCount && this.previousItemCount > 0) {
          this.showSuccessNotification();
        }
        this.previousItemCount = count;
      });
  }

  ngOnInit() {
    // Component initialization logic can go here if needed
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  private showSuccessNotification() {
    // Clear any existing timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.showNotification = true;

    // Hide notification after 3 seconds
    this.notificationTimeout = window.setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
} 