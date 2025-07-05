import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
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
                    map(({ items, companyName }) =>
                        B2BCartActions.loadB2BCartSuccess({ items, companyId, companyName })
                    ),
                    catchError(error =>
                        of(B2BCartActions.loadB2BCartFailure({
                            error: error.message || 'Failed to load cart'
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
                            error: error.message || 'Failed to add item to cart'
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
                        error: 'Company information not available'
                    }));
                }

                return this.b2bCartService.updateCartItem(productId, quantity, companyInfo.companyId).pipe(
                    map(() => B2BCartActions.updateB2BCartItemSuccess({ productId, quantity })),
                    catchError(error =>
                        of(B2BCartActions.updateB2BCartItemFailure({
                            error: error.message || 'Failed to update cart item'
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
                        error: 'Company information not available'
                    }));
                }

                return this.b2bCartService.removeFromCart(productId, companyInfo.companyId).pipe(
                    map(() => B2BCartActions.removeFromB2BCartSuccess({ productId })),
                    catchError(error =>
                        of(B2BCartActions.removeFromB2BCartFailure({
                            error: error.message || 'Failed to remove item from cart'
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
                        error: 'Company information not available'
                    }));
                }

                return this.b2bCartService.clearCart(companyInfo.companyId).pipe(
                    map(() => B2BCartActions.clearB2BCartSuccess()),
                    catchError(error =>
                        of(B2BCartActions.clearB2BCartFailure({
                            error: error.message || 'Failed to clear cart'
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
                            error: error.message || 'Failed to sync cart'
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
                    'Cart updated successfully'
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
                    'Item removed from cart'
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
                    'Cart cleared successfully'
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
                B2BCartActions.syncB2BCartFailure
            ),
            tap(({ error }) => {
                this.toastService.showError(error);
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