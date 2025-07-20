import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, tap, mergeMap } from 'rxjs/operators';
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
                    map(({ items, companyName }) =>
                        B2BCartActions.loadB2BCartSuccess({ items, companyId, companyName })
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
                    map((item: B2BCartItem) => B2BCartActions.addToB2BCartSuccess({ item })),
                    catchError(error =>
                        of(B2BCartActions.addToB2BCartFailure({
                            error: error.message || this.translationService.translate('b2bCart.failedToAdd')
                        }))
                    )
                )
            )
        )
    );

    // Update cart item effect
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

                return this.b2bCartService.updateCartItem(productId, quantity, companyInfo.companyId).pipe(
                    map(() => B2BCartActions.updateB2BCartItemSuccess({ productId, quantity })),
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
                    map(() => B2BCartActions.removeFromB2BCartSuccess({ productId })),
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
                B2BCartActions.addAllToB2BCartFromOfferFailure
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
            switchMap(({ products, companyId, partnerOfferId, partnerOfferName, partnerOfferType, partnerOfferDiscount, partnerOfferValidUntil }) => {
                // Create observables for each product add operation
                const addObservables = products.map(({ productId, quantity }) =>
                    this.b2bCartService.addToCart(productId, quantity, companyId).pipe(
                        map((item: B2BCartItem) => ({ success: true as const, item })),
                        catchError(error => {
                            console.error(`Failed to add product ${productId} to cart:`, error);
                            return of({ success: false as const, error, item: null as B2BCartItem | null });
                        })
                    )
                );

                // Execute all add operations in parallel
                return forkJoin(addObservables).pipe(
                    map(results => {
                        const addedItems: B2BCartItem[] = [];
                        let addedCount = 0;
                        let skippedCount = 0;

                        results.forEach(result => {
                            if (result.success && result.item) {
                                addedItems.push(result.item);
                                addedCount++;
                            } else {
                                skippedCount++;
                            }
                        });

                        return B2BCartActions.addAllToB2BCartFromOfferSuccess({
                            items: addedItems,
                            addedCount,
                            skippedCount
                        });
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