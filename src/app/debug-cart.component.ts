import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import * as CartActions from './features/b2c/cart/store/cart.actions';
import * as CartSelectors from './features/b2c/cart/store/cart.selectors';

@Component({
    selector: 'app-debug-cart',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="p-4 bg-gray-100 m-4 rounded">
      <h2 class="text-xl font-bold mb-4">Cart Debug Component</h2>
      
      <div class="mb-4">
        <h3 class="font-semibold">Cart State:</h3>
        <p>Is Cart Open: {{ isCartOpen$ | async }}</p>
        <p>Is Loading: {{ isLoading$ | async }}</p>
        <p>Cart Items Count: {{ cartItemCount$ | async }}</p>
        <p>Is Cart Empty: {{ isCartEmpty$ | async }}</p>
        <p>Cart Error: {{ cartError$ | async }}</p>
      </div>

      <div class="mb-4">
        <h3 class="font-semibold">Cart Items:</h3>
        <pre>{{ (cartItems$ | async) | json }}</pre>
      </div>

      <div class="mb-4">
        <h3 class="font-semibold">Cart Summary:</h3>
        <pre>{{ (cartSummary$ | async) | json }}</pre>
      </div>

      <div class="space-x-2">
        <button 
          (click)="testAddToCart()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Add to Cart
        </button>
        
        <button 
          (click)="openCart()"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Open Cart
        </button>
        
        <button 
          (click)="closeCart()"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close Cart
        </button>
        
        <button 
          (click)="loadCart()"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Load Cart
        </button>
        
        <button 
          (click)="testToggleCart()"
          class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Toggle Cart
        </button>
      </div>
    </div>
  `
})
export class DebugCartComponent implements OnInit {
    private store = inject(Store);

    // Observables
    isCartOpen$ = this.store.select(CartSelectors.selectIsCartOpen);
    isLoading$ = this.store.select(CartSelectors.selectIsCartLoading);
    cartItems$ = this.store.select(CartSelectors.selectCartItems);
    cartItemCount$ = this.store.select(CartSelectors.selectCartItemCount);
    isCartEmpty$ = this.store.select(CartSelectors.selectIsCartEmpty);
    cartError$ = this.store.select(CartSelectors.selectCartError);
    cartSummary$ = this.store.select(CartSelectors.selectCartSummary);

    constructor() {
        console.log('Debug Cart Component initialized');

        // Subscribe to all observables for debugging
        this.isCartOpen$.subscribe(isOpen => {
            console.log('Debug - isCartOpen changed:', isOpen);
            console.log('Debug - isCartOpen timestamp:', new Date().toISOString());
        });

        this.cartItems$.subscribe(items => {
            console.log('Debug - cartItems changed:', items);
            console.log('Debug - cartItems length:', items?.length || 0);
        });

        this.isLoading$.subscribe(isLoading => {
            console.log('Debug - isLoading changed:', isLoading);
        });

        this.cartError$.subscribe(error => {
            if (error) {
                console.log('Debug - cartError:', error);
            }
        });

        this.cartItemCount$.subscribe(count => {
            console.log('Debug - cartItemCount changed:', count);
        });

        this.isCartEmpty$.subscribe(isEmpty => {
            console.log('Debug - isCartEmpty changed:', isEmpty);
        });
    }

    ngOnInit() {
        // Load cart on initialization
        console.log('Debug - Loading cart on init');
        this.store.dispatch(CartActions.loadCart());
    }

    testAddToCart() {
        console.log('Debug - Testing add to cart');
        // Use a known product ID from the seed data
        this.store.dispatch(CartActions.addToCart({
            productId: '11234567-89ab-cdef-0123-456789abcdef', // Solar Panel 400W
            quantity: 1
        }));
    }

    openCart() {
        console.log('Debug - Opening cart manually');
        this.store.dispatch(CartActions.openCart());
    }

    closeCart() {
        console.log('Debug - Closing cart manually');
        this.store.dispatch(CartActions.closeCart());
    }

    loadCart() {
        console.log('Debug - Loading cart manually');
        this.store.dispatch(CartActions.loadCart());
    }

    testToggleCart() {
        console.log('Debug - Toggling cart');
        this.store.dispatch(CartActions.toggleCart());
    }
} 