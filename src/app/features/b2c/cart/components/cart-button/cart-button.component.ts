import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as CartActions from '../../store/cart.actions';
import * as CartSelectors from '../../store/cart.selectors';
import { LucideAngularModule, ShoppingCart } from 'lucide-angular';

@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button 
      (click)="openCart()"
      class="relative p-2 text-gray-600 hover:text-solar-600 transition-all duration-300 hover:scale-110 hover:bg-solar-50 rounded-full"
      aria-label="Open cart"
    >
      <!-- Cart Icon -->
      <lucide-angular 
        name="shopping-cart" 
        class="w-6 h-6"
        [img]="ShoppingCartIcon">
      </lucide-angular>
      
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

  // Lucide Icons
  readonly ShoppingCartIcon = ShoppingCart;

  openCart() {
    this.store.dispatch(CartActions.openCart());
  }
} 