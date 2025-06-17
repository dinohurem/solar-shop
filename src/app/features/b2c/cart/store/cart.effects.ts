import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { CartService } from '../services/cart.service';
import * as CartActions from './cart.actions';

@Injectable()
export class CartEffects {
    private actions$ = inject(Actions);
    private cartService = inject(CartService);

    // Load Cart Effect
    loadCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.loadCart),
            switchMap(() =>
                this.cartService.loadCart().pipe(
                    map(cart => cart
                        ? CartActions.loadCartSuccess({ cart })
                        : CartActions.loadCartSuccess({ cart: null as any })
                    ),
                    catchError(error => of(CartActions.loadCartFailure({ error: error.message })))
                )
            )
        )
    );

    // Clear Cart Effect
    clearCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.clearCart),
            switchMap(() =>
                this.cartService.clearCart().pipe(
                    map(() => CartActions.clearCartSuccess()),
                    catchError(error => of(CartActions.clearCartFailure({ error: error.message })))
                )
            )
        )
    );

    // Order Completion Effect - Automatically clear cart when order is completed
    orderCompleted$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.orderCompleted),
            switchMap(() =>
                this.cartService.clearCart().pipe(
                    map(() => CartActions.clearCartSuccess()),
                    catchError(error => of(CartActions.clearCartFailure({ error: error.message })))
                )
            )
        )
    );

    // Add to Cart Effect
    addToCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.addToCart),
            tap(action => console.log('Cart Effect - addToCart action received:', action)),
            switchMap(({ productId, quantity, variantId }) =>
                this.cartService.addToCart(productId, quantity, variantId).pipe(
                    tap(cart => {
                        console.log('Cart Effect - addToCart service returned cart:', cart);
                        console.log('Cart Effect - cart items count:', cart?.items?.length || 0);
                    }),
                    map(cart => {
                        const successAction = CartActions.addToCartSuccess({ cart });
                        console.log('Cart Effect - dispatching addToCartSuccess:', successAction);
                        console.log('Cart Effect - addToCartSuccess cart:', cart);
                        return successAction;
                    }
                    ),
                    catchError(error => {
                        console.error('Cart Effect - addToCart error:', error);
                        return of(CartActions.addToCartFailure({ error: error.message }));
                    })
                )
            )
        )
    );

    // Update Cart Item Effect
    updateCartItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.updateCartItem),
            switchMap(({ itemId, quantity }) =>
                this.cartService.updateCartItem(itemId, quantity).pipe(
                    map(cart => CartActions.updateCartItemSuccess({ cart })),
                    catchError(error => of(CartActions.updateCartItemFailure({ error: error.message })))
                )
            )
        )
    );

    // Remove from Cart Effect
    removeFromCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.removeFromCart),
            switchMap(({ itemId }) =>
                this.cartService.removeFromCart(itemId).pipe(
                    map(cart => CartActions.removeFromCartSuccess({ cart })),
                    catchError(error => of(CartActions.removeFromCartFailure({ error: error.message })))
                )
            )
        )
    );

    // Increase Quantity Effect
    increaseQuantity$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.increaseQuantity),
            switchMap(({ itemId }) =>
                // Get current cart state and calculate new quantity
                this.cartService.loadCart().pipe(
                    switchMap(cart => {
                        if (!cart) return of(CartActions.updateCartItemFailure({ error: 'Cart not found' }));

                        const item = cart.items.find(i => i.id === itemId);
                        if (!item) return of(CartActions.updateCartItemFailure({ error: 'Item not found' }));

                        const newQuantity = Math.min(item.quantity + 1, item.maxQuantity);
                        return this.cartService.updateCartItem(itemId, newQuantity).pipe(
                            map(updatedCart => CartActions.updateCartItemSuccess({ cart: updatedCart })),
                            catchError(error => of(CartActions.updateCartItemFailure({ error: error.message })))
                        );
                    })
                )
            )
        )
    );

    // Decrease Quantity Effect
    decreaseQuantity$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.decreaseQuantity),
            switchMap(({ itemId }) =>
                this.cartService.loadCart().pipe(
                    switchMap(cart => {
                        if (!cart) return of(CartActions.updateCartItemFailure({ error: 'Cart not found' }));

                        const item = cart.items.find(i => i.id === itemId);
                        if (!item) return of(CartActions.updateCartItemFailure({ error: 'Item not found' }));

                        const newQuantity = Math.max(item.quantity - 1, item.minQuantity);
                        if (newQuantity === 0) {
                            // Remove item if quantity becomes 0
                            return this.cartService.removeFromCart(itemId).pipe(
                                map(updatedCart => CartActions.removeFromCartSuccess({ cart: updatedCart })),
                                catchError(error => of(CartActions.removeFromCartFailure({ error: error.message })))
                            );
                        } else {
                            return this.cartService.updateCartItem(itemId, newQuantity).pipe(
                                map(updatedCart => CartActions.updateCartItemSuccess({ cart: updatedCart })),
                                catchError(error => of(CartActions.updateCartItemFailure({ error: error.message })))
                            );
                        }
                    })
                )
            )
        )
    );

    // Apply Coupon Effect
    applyCoupon$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.applyCoupon),
            switchMap(({ code }) =>
                this.cartService.applyCoupon(code).pipe(
                    map(cart => CartActions.applyCouponSuccess({ cart })),
                    catchError(error => of(CartActions.applyCouponFailure({ error: error.message })))
                )
            )
        )
    );

    // Remove Coupon Effect
    removeCoupon$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.removeCoupon),
            switchMap(({ couponId }) =>
                this.cartService.removeCoupon(couponId).pipe(
                    map(cart => CartActions.removeCouponSuccess({ cart })),
                    catchError(error => of(CartActions.removeCouponFailure({ error: error.message })))
                )
            )
        )
    );

    // Load Available Coupons Effect
    loadAvailableCoupons$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.loadAvailableCoupons),
            switchMap(() =>
                this.cartService.loadAvailableCoupons().pipe(
                    map(coupons => CartActions.loadAvailableCouponsSuccess({ coupons })),
                    catchError(error => of(CartActions.loadAvailableCouponsFailure({ error: error.message })))
                )
            )
        )
    );

    // Auto-load cart on app initialization
    autoLoadCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType('[App] Init'), // This would be dispatched on app initialization
            map(() => CartActions.loadCart())
        )
    );
} 