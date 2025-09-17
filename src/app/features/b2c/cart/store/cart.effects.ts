import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap, take, delay } from 'rxjs/operators';
import { CartService } from '../services/cart.service';
import * as CartActions from './cart.actions';
import * as AuthActions from '../../../../core/auth/store/auth.actions';
import { from } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCartItems } from './cart.selectors';

@Injectable()
export class CartEffects {
    private actions$ = inject(Actions);
    private cartService = inject(CartService);
    private store = inject(Store);

    // Load Cart Effect - initializes cart if needed
    loadCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.loadCart),
            switchMap(() =>
                from(this.cartService.initializeCart()).pipe(
                    // Add a small delay to ensure BehaviorSubject is updated
                    delay(10),
                    switchMap(() => {
                        return this.cartService.loadCart();
                    }),
                    map(cart => {
                        return cart
                            ? CartActions.loadCartSuccess({ cart })
                            : CartActions.loadCartSuccess({ cart: null as any });
                    }),
                    catchError(error => {
                        // For guest users or any error, ensure we set isLoading to false
                        return of(CartActions.loadCartSuccess({ cart: null as any }));
                    })
                )
            )
        )
    );

    // Handle user profile load success - initialize cart for already authenticated user
    loadUserProfileSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadUserProfileSuccess),
            switchMap(({ user }) =>
                from(this.cartService.handleUserLogin(user.id)).pipe(
                    switchMap(() => this.cartService.loadCart()),
                    map(cart => {
                        return CartActions.loadCartSuccess({ cart });
                    }),
                    catchError(error => {
                        return of(CartActions.loadCartFailure({ error: error.message }));
                    })
                )
            )
        )
    );

    // Handle logout - clear cart
    logoutSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logoutSuccess),
            switchMap(() =>
                from(this.cartService.handleUserLogout()).pipe(
                    map(() => CartActions.clearCartSuccess())
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
            tap(action => console.debug('Cart Effect - addToCart action received:', action)),
            switchMap(({ productId, quantity, variantId }) =>
                this.cartService.addToCart(productId, quantity, variantId).pipe(
                    tap(cart => {
                    }),
                    map(cart => {
                        const successAction = CartActions.addToCartSuccess({ cart });
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
                this.store.select(selectCartItems).pipe(
                    take(1),
                    switchMap(items => {
                        const item = items.find(i => i.id === itemId);
                        if (!item) return of(CartActions.updateCartItemFailure({ error: 'Item not found' }));

                        const newQuantity = Math.min(item.quantity + 1, item.maxQuantity);

                        return this.cartService.updateCartItem(itemId, newQuantity).pipe(
                            map(cart => CartActions.updateCartItemSuccess({ cart })),
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
                this.store.select(selectCartItems).pipe(
                    take(1),
                    switchMap((items) => {
                        const item = items.find(i => i.id === itemId);
                        if (!item) {
                            return of(CartActions.updateCartItemFailure({ error: 'Item not found' }));
                        }

                        const newQuantity = Math.max(item.quantity - 1, item.minQuantity || 1);

                        if (newQuantity <= 0 || newQuantity < item.minQuantity) {
                            // Remove if quantity drops to zero or below min
                            return this.cartService.removeFromCart(itemId).pipe(
                                map(cart => CartActions.removeFromCartSuccess({ cart })),
                                catchError(error => of(CartActions.removeFromCartFailure({ error: error.message })))
                            );
                        }

                        return this.cartService.updateCartItem(itemId, newQuantity).pipe(
                            map(cart => CartActions.updateCartItemSuccess({ cart })),
                            catchError(error => of(CartActions.updateCartItemFailure({ error: error.message })))
                        );
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

    // Add to Cart from Offer Effect
    addToCartFromOffer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.addToCartFromOffer),
            switchMap(({ productId, quantity, variantId, offerId, offerName, offerType, offerDiscount, offerOriginalPrice, offerValidUntil, individualDiscount, individualDiscountType }) =>
                this.cartService.addToCartFromOffer(
                    productId,
                    quantity,
                    variantId,
                    offerId,
                    offerName,
                    offerType,
                    offerDiscount,
                    offerOriginalPrice,
                    offerValidUntil,
                    individualDiscount,
                    individualDiscountType
                ).pipe(
                    map(cart => CartActions.addToCartFromOfferSuccess({ cart })),
                    catchError(error => of(CartActions.addToCartFromOfferFailure({ error: error.message })))
                )
            )
        )
    );

    // Add All to Cart from Offer Effect
    addAllToCartFromOffer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CartActions.addAllToCartFromOffer),
            switchMap(({ products, offerId, offerName, offerType, offerDiscount, offerValidUntil }) =>
                this.cartService.addAllToCartFromOffer(
                    products, 
                    offerId, 
                    offerName, 
                    offerType, 
                    offerDiscount, 
                    offerValidUntil
                ).pipe(
                    map(({ cart, addedCount, skippedCount }) => CartActions.addAllToCartFromOfferSuccess({ cart, addedCount, skippedCount })),
                    catchError(error => of(CartActions.addAllToCartFromOfferFailure({ error: error.message })))
                )
            )
        )
    );
} 