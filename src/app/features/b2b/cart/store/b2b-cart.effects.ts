import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import { ToastService } from '../../../../shared/services/toast.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { B2BCartService } from '../services/b2b-cart.service';
import { B2BCartItem } from '../models/b2b-cart.model';
import * as B2BCartActions from './b2b-cart.actions';
import * as B2BCartSelectors from './b2b-cart.selectors';

@Injectable()
export class B2BCartEffects {

    constructor(
        private actions$: Actions,
        private store: Store,
        private b2bCartService: B2BCartService,
        private toastService: ToastService,
        private translationService: TranslationService
    ) { }

    // Load cart effect
    loadB2BCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.loadB2BCart),
            switchMap(({ companyId }) =>
                this.b2bCartService.loadCart(companyId).pipe(
                    map(({ items, companyName, appliedCoupons, couponDiscount }) =>
                        B2BCartActions.loadB2BCartSuccess({ items, companyId, companyName, appliedCoupons, couponDiscount })
                    ),
                    catchError(error =>
                        of(B2BCartActions.loadB2BCartFailure({
                            error: error.message || this.translationService.translate('b2bCart.failedToLoad')
                        }))
                    )
                )
            )
        )
    );

    // Add to cart effect
    addToB2BCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.addToB2BCart),
            switchMap(({ productId, quantity, companyId }) =>
                this.b2bCartService.addToCart(productId, quantity, companyId).pipe(
                    switchMap(() =>
                        // Reload the cart to get all items with updated pricing and bundle status
                        this.b2bCartService.loadCart(companyId).pipe(
                            map(({ items, companyName, appliedCoupons, couponDiscount }) =>
                                B2BCartActions.loadB2BCartSuccess({
                                    items,
                                    companyId,
                                    companyName,
                                    appliedCoupons,
                                    couponDiscount
                                })
                            )
                        )
                    ),
                    catchError(error =>
                        of(B2BCartActions.addToB2BCartFailure({
                            error: error.message || this.translationService.translate('b2bCart.failedToAdd')
                        }))
                    )
                )
            )
        )
    );

    // Update cart item effect - optimized to refresh only specific product price
    updateB2BCartItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.updateB2BCartItem),
            withLatestFrom(this.store.select(B2BCartSelectors.selectB2BCartCompanyInfo)),
            switchMap(([{ productId, quantity }, companyInfo]) => {
                if (!companyInfo.companyId) {
                    return of(B2BCartActions.updateB2BCartItemFailure({
                        error: this.translationService.translate('b2bCart.companyInfoNotAvailable')
                    }));
                }

                return this.b2bCartService.updateCartItemWithPricing(productId, quantity, companyInfo.companyId).pipe(
                    switchMap((updatedItem) => {
                        if (updatedItem) {
                            // Item was updated with new pricing
                            return of(B2BCartActions.updateB2BCartItemWithPricing({ updatedItem }));
                        } else {
                            // Item was removed (quantity = 0), dispatch success action
                            return of(B2BCartActions.updateB2BCartItemSuccess({ productId, quantity: 0 }));
                        }
                    }),
                    catchError(error =>
                        of(B2BCartActions.updateB2BCartItemFailure({
                            error: error.message || this.translationService.translate('b2bCart.failedToUpdate')
                        }))
                    )
                );
            })
        )
    );

    // Remove from cart effect
    removeFromB2BCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.removeFromB2BCart),
            withLatestFrom(this.store.select(B2BCartSelectors.selectB2BCartCompanyInfo)),
            switchMap(([{ productId }, companyInfo]) => {
                if (!companyInfo.companyId) {
                    return of(B2BCartActions.removeFromB2BCartFailure({
                        error: this.translationService.translate('b2bCart.companyInfoNotAvailable')
                    }));
                }

                return this.b2bCartService.removeFromCart(productId, companyInfo.companyId).pipe(
                    switchMap(() =>
                        // Reload the cart to get remaining items with updated pricing
                        this.b2bCartService.loadCart(companyInfo.companyId!).pipe(
                            map(({ items, companyName, appliedCoupons, couponDiscount }) =>
                                B2BCartActions.loadB2BCartSuccess({
                                    items,
                                    companyId: companyInfo.companyId!,
                                    companyName,
                                    appliedCoupons,
                                    couponDiscount
                                })
                            )
                        )
                    ),
                    catchError(error =>
                        of(B2BCartActions.removeFromB2BCartFailure({
                            error: error.message || this.translationService.translate('b2bCart.failedToRemove')
                        }))
                    )
                );
            })
        )
    );

    // Clear cart effect
    clearB2BCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.clearB2BCart),
            withLatestFrom(this.store.select(B2BCartSelectors.selectB2BCartCompanyInfo)),
            switchMap(([_, companyInfo]) => {
                if (!companyInfo.companyId) {
                    return of(B2BCartActions.clearB2BCartFailure({
                        error: this.translationService.translate('b2bCart.companyInfoNotAvailable')
                    }));
                }

                return this.b2bCartService.clearCart(companyInfo.companyId).pipe(
                    map(() => B2BCartActions.clearB2BCartSuccess()),
                    catchError(error =>
                        of(B2BCartActions.clearB2BCartFailure({
                            error: error.message || this.translationService.translate('b2bCart.failedToClear')
                        }))
                    )
                );
            })
        )
    );

    // Sync cart effect
    syncB2BCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.syncB2BCart),
            switchMap(({ companyId }) =>
                this.b2bCartService.loadCart(companyId).pipe(
                    map(({ items }) => B2BCartActions.syncB2BCartSuccess({ items })),
                    catchError(error =>
                        of(B2BCartActions.syncB2BCartFailure({
                            error: error.message || this.translationService.translate('b2bCart.failedToSync')
                        }))
                    )
                )
            )
        )
    );

    // Success toast notifications
    addToCartSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.addToB2BCartSuccess),
            tap(({ item }) => {
                const addedToCartMessage = this.translationService.translate('b2bCart.addedToCart');
                this.toastService.showSuccess(
                    `${item.name} ${addedToCartMessage}`
                );

                // Open the cart sidebar to show the added product
                this.store.dispatch(B2BCartActions.openB2BCartSidebar());
            })
        ),
        { dispatch: false }
    );

    updateCartSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.updateB2BCartItemSuccess),
            tap(() => {
                this.toastService.showSuccess(
                    this.translationService.translate('b2bCart.cartUpdated')
                );
            })
        ),
        { dispatch: false }
    );

    // Silent success for optimized updates - no toast to avoid UI disruption
    updateCartWithPricingSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.updateB2BCartItemWithPricing),
            tap(() => {
                // Silent update - no toast notification for seamless UX
            })
        ),
        { dispatch: false }
    );

    removeFromCartSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.removeFromB2BCartSuccess),
            tap(() => {
                this.toastService.showSuccess(
                    this.translationService.translate('b2bCart.itemRemoved')
                );
            })
        ),
        { dispatch: false }
    );

    clearCartSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.clearB2BCartSuccess),
            tap(() => {
                this.toastService.showSuccess(
                    this.translationService.translate('b2bCart.cartCleared')
                );
            })
        ),
        { dispatch: false }
    );

    applyCoupon$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.applyB2BCoupon),
            withLatestFrom(
                this.store.select(B2BCartSelectors.selectB2BCartItems),
                this.store.select(B2BCartSelectors.selectB2BCartAppliedCoupons)
            ),
            switchMap(([{ code, companyId }, items, appliedCoupons]) => {
                if (!companyId) {
                    return of(B2BCartActions.applyB2BCouponFailure({
                        error: this.translationService.translate('b2b.auth.companyIdNotFound')
                    }));
                }

                if (appliedCoupons.length > 0) {
                    return of(B2BCartActions.applyB2BCouponFailure({
                        error: this.translationService.translate('cart.singleCouponOnly')
                    }));
                }

                return this.b2bCartService.applyCoupon(code, items, companyId).pipe(
                    map(({ coupon, discount }) =>
                        B2BCartActions.applyB2BCouponSuccess({ coupon, discount })
                    ),
                    catchError(error =>
                        of(B2BCartActions.applyB2BCouponFailure({
                            error: error.message || this.translationService.translate('cart.couponValidationError')
                        }))
                    )
                );
            })
        )
    );

    applyCouponSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.applyB2BCouponSuccess),
            tap(({ coupon }) => {
                this.toastService.showSuccess(
                    this.translationService.translate('cart.couponAppliedSuccess', { code: coupon.code })
                );
            })
        ),
        { dispatch: false }
    );

    removeCoupon$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.removeB2BCoupon),
            withLatestFrom(
                this.store.select(B2BCartSelectors.selectB2BCartCompanyId),
                this.store.select(B2BCartSelectors.selectB2BCartAppliedCoupons)
            ),
            switchMap(([{ couponId }, companyId, appliedCoupons]) => {
                if (!companyId) {
                    return of(B2BCartActions.removeB2BCouponFailure({
                        error: this.translationService.translate('b2b.auth.companyIdNotFound')
                    }));
                }

                const coupon = appliedCoupons.find(c => c.id === couponId);

                return this.b2bCartService.removeCoupon(couponId, companyId).pipe(
                    map(() =>
                        B2BCartActions.removeB2BCouponSuccess({ couponId, couponCode: coupon?.code })
                    ),
                    catchError(error =>
                        of(B2BCartActions.removeB2BCouponFailure({
                            error: error.message || this.translationService.translate('cart.couponValidationError')
                        }))
                    )
                );
            })
        )
    );

    removeCouponSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.removeB2BCouponSuccess),
            tap(({ couponCode }) => {
                const message = couponCode
                    ? this.translationService.translate('cart.couponRemoved', { code: couponCode })
                    : this.translationService.translate('cart.couponRemovedGeneric');
                this.toastService.showSuccess(message);
            })
        ),
        { dispatch: false }
    );

    // Error toast notifications
    cartError$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                B2BCartActions.loadB2BCartFailure,
                B2BCartActions.addToB2BCartFailure,
                B2BCartActions.updateB2BCartItemFailure,
                B2BCartActions.removeFromB2BCartFailure,
                B2BCartActions.clearB2BCartFailure,
                B2BCartActions.syncB2BCartFailure,
                B2BCartActions.addAllToB2BCartFromOfferFailure,
                B2BCartActions.applyB2BCouponFailure,
                B2BCartActions.removeB2BCouponFailure
            ),
            tap(({ error }) => {
                this.toastService.showError(error);
            })
        ),
        { dispatch: false }
    );

    // Add all to cart from partner offer effect
    addAllToB2BCartFromOffer$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.addAllToB2BCartFromOffer),
            switchMap(({ products, companyId, partnerOfferId, partnerOfferName, partnerOfferType, partnerOfferDiscount, partnerOfferValidUntil, isBundle, bundleProductIds }) => {
                // Create observables for each product add operation
                const addObservables = products.map(({ productId, quantity, individualDiscount, individualDiscountType, originalPrice }) =>
                    this.b2bCartService.addToCart(productId, quantity, companyId, {
                        partnerOfferId,
                        partnerOfferName,
                        partnerOfferType,
                        partnerOfferDiscount,
                        partnerOfferValidUntil,
                        individualDiscount,
                        individualDiscountType,
                        originalPrice,
                        isBundle,
                        bundleProductIds
                    }).pipe(
                        map((item: B2BCartItem) => ({ success: true as const, item })),
                        catchError(error => {
                            console.error(`Failed to add product ${productId} to cart:`, error);
                            return of({ success: false as const, error, item: null as B2BCartItem | null });
                        })
                    )
                );

                // Execute all add operations in parallel
                return forkJoin(addObservables).pipe(
                    switchMap(results => {
                        let addedCount = 0;
                        let skippedCount = 0;

                        results.forEach(result => {
                            if (result.success && result.item) {
                                addedCount++;
                            } else {
                                skippedCount++;
                            }
                        });

                        // After all items are added, reload the cart to get the correct bundle status for ALL items
                        return this.b2bCartService.loadCart(companyId).pipe(
                            map(({ items, companyName, appliedCoupons, couponDiscount }) => {
                                // Dispatch loadB2BCartSuccess to update the entire cart state with correct bundle status
                                this.store.dispatch(B2BCartActions.loadB2BCartSuccess({
                                    items,
                                    companyId,
                                    companyName,
                                    appliedCoupons,
                                    couponDiscount
                                }));

                                return B2BCartActions.addAllToB2BCartFromOfferSuccess({
                                    items: [],
                                    addedCount,
                                    skippedCount
                                });
                            })
                        );
                    }),
                    catchError(error => {
                        return of(B2BCartActions.addAllToB2BCartFromOfferFailure({
                            error: error.message || this.translationService.translate('b2bCart.failedToAddProducts')
                        }));
                    })
                );
            })
        )
    );

    // Add all to cart from partner offer success notifications
    addAllToB2BCartFromOfferSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.addAllToB2BCartFromOfferSuccess),
            tap(({ addedCount, skippedCount }) => {
                if (addedCount > 0) {
                    const message = this.translationService.translate('b2bCart.productsAddedToCart', { count: addedCount });
                    this.toastService.showSuccess(message);

                    if (skippedCount > 0) {
                        const warningMessage = this.translationService.translate('b2bCart.productsSkipped', { count: skippedCount });
                        this.toastService.showWarning(warningMessage);
                    }

                    // Open the cart sidebar to show the added products
                    this.store.dispatch(B2BCartActions.openB2BCartSidebar());
                } else {
                    this.toastService.showError(this.translationService.translate('b2bCart.noProductsAdded'));
                }
            })
        ),
        { dispatch: false }
    );

    // Auto-sync cart periodically (every 5 minutes)
    autoSyncCart$ = createEffect(() =>
        this.actions$.pipe(
            ofType(B2BCartActions.loadB2BCartSuccess),
            switchMap(({ companyId }) => {
                // Create interval that syncs every 5 minutes
                return new Promise(resolve => {
                    setInterval(() => {
                        this.store.dispatch(B2BCartActions.syncB2BCart({ companyId }));
                    }, 5 * 60 * 1000); // 5 minutes
                });
            })
        ),
        { dispatch: false }
    );
} 