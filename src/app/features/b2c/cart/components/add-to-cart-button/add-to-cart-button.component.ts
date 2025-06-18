import { Component, Input, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as CartActions from '../../store/cart.actions';
import * as CartSelectors from '../../store/cart.selectors';

@Component({
  selector: 'app-add-to-cart-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      #addButton
      (click)="addToCart()"
      [disabled]="isLoading$ | async"
      [class]="buttonClasses"
    >
      <span *ngIf="!(isLoading$ | async)" class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"/>
        </svg>
        <span>{{ buttonText }}</span>
      </span>
      
      <span *ngIf="isLoading$ | async" class="flex items-center space-x-2">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Adding...</span>
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
    }

    .flying-cart-animation {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      display: none;
      will-change: transform, opacity;
      backface-visibility: hidden;
    }

    .flying-cart-animation.animate {
      display: block;
      animation: flyToCart 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }

    @keyframes flyToCart {
      0% {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }
      50% {
        opacity: 0.8;
        transform: translate3d(50vw, -30px, 0) scale(0.8);
      }
      100% {
        opacity: 0;
        transform: translate3d(100vw, -50px, 0) scale(0.5);
      }
    }

    /* Button success animation */
    .button-success {
      background-color: #10b981 !important;
      transform: scale(0.98);
      transition: all 1s ease;
    }

    .button-success svg {
      animation: bounce 1s ease;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }
  `]
})
export class AddToCartButtonComponent {
  private store = inject(Store);

  @ViewChild('addButton', { static: true }) addButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('flyingCart', { static: true }) flyingCart!: ElementRef<HTMLDivElement>;

  @Input() productId!: string;
  @Input() variantId?: string;
  @Input() quantity: number = 1;
  @Input() buttonText: string = 'Add to Cart';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() fullWidth: boolean = false;

  isLoading$ = this.store.select(CartSelectors.selectIsCartLoading);
  isAnimating = false;

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    // Variant classes
    const variantClasses = {
      primary: 'bg-solar-600 text-white hover:bg-solar-700 focus:ring-2 focus:ring-solar-500 focus:ring-offset-2',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
      outline: 'border-2 border-solar-600 text-solar-600 hover:bg-solar-600 hover:text-white focus:ring-2 focus:ring-solar-500 focus:ring-offset-2'
    };

    // Width classes
    const widthClasses = this.fullWidth ? 'w-full' : '';

    return [
      baseClasses,
      sizeClasses[this.size],
      variantClasses[this.variant],
      widthClasses
    ].filter(Boolean).join(' ');
  }

  addToCart() {
    if (this.productId) {

      // Dispatch the add to cart action
      this.store.dispatch(CartActions.addToCart({
        productId: this.productId,
        quantity: this.quantity,
        variantId: this.variantId
      }));

      // Add success animation to button
      this.addButtonSuccessAnimation();
    }
  }

  private addButtonSuccessAnimation() {
    const button = this.addButton.nativeElement;
    button.classList.add('button-success');

    setTimeout(() => {
      button.classList.remove('button-success');
    }, 600);
  }
} 