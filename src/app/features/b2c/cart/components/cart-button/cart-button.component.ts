import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as CartActions from '../../store/cart.actions';
import * as CartSelectors from '../../store/cart.selectors';

@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      (click)="openCart()"
      class="relative p-2 text-gray-600 hover:text-solar-600 transition-all duration-300 hover:scale-110 hover:bg-solar-50 rounded-full"
      aria-label="Open cart"
    >
      <!-- Cart Icon -->
      <svg 
        class="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"
        />
      </svg>
      
      <!-- Item Count Badge -->
      <span 
        *ngIf="(cartItemCount$ | async) && (cartItemCount$ | async)! > 0"
        class="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
      >
        {{ cartItemCount$ | async }}
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class CartButtonComponent {
  private store = inject(Store);

  cartItemCount$ = this.store.select(CartSelectors.selectCartItemCount);

  openCart() {
    this.store.dispatch(CartActions.openCart());
  }
} 