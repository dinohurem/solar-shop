import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom, tap } from 'rxjs/operators';
import * as WishlistActions from './wishlist.actions';
import { selectCurrentUser } from '../../../../core/auth/store/auth.selectors';
import { SupabaseService } from '../../../../services/supabase.service';
import { WishlistItem } from '../../../../shared/models/wishlist.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { TranslationService } from '../../../../shared/services/translation.service';

@Injectable()
export class WishlistEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private supabaseService = inject(SupabaseService);
    private toastService = inject(ToastService);
    private translationService = inject(TranslationService);

    loadWishlist$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WishlistActions.loadWishlist),
            withLatestFrom(this.store.select(selectCurrentUser)),
            switchMap(([action, user]) => {
                if (!user?.id) {
                    return of(WishlistActions.loadWishlistSuccess({ items: [] }));
                }

                return from(this.loadUserWishlist(user.id)).pipe(
                    map((items) => WishlistActions.loadWishlistSuccess({ items })),
                    catchError((error) =>
                        of(WishlistActions.loadWishlistFailure({
                            error: error.message || 'Failed to load wishlist'
                        }))
                    )
                );
            })
        )
    );

    addToWishlist$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WishlistActions.addToWishlist),
            withLatestFrom(this.store.select(selectCurrentUser)),
            switchMap(([action, user]) => {
                if (!user?.id) {
                    return of(WishlistActions.addToWishlistFailure({
                        error: 'User not authenticated'
                    }));
                }

                return from(this.addProductToWishlist(user.id, action.productId)).pipe(
                    map((item) => WishlistActions.addToWishlistSuccess({ item })),
                    catchError((error) =>
                        of(WishlistActions.addToWishlistFailure({
                            error: error.message || 'Failed to add to wishlist'
                        }))
                    )
                );
            })
        )
    );

    removeFromWishlist$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WishlistActions.removeFromWishlist),
            withLatestFrom(this.store.select(selectCurrentUser)),
            switchMap(([action, user]) => {
                if (!user?.id) {
                    return of(WishlistActions.removeFromWishlistFailure({
                        error: 'User not authenticated'
                    }));
                }

                return from(this.removeProductFromWishlist(user.id, action.productId)).pipe(
                    map(() => WishlistActions.removeFromWishlistSuccess({
                        productId: action.productId
                    })),
                    catchError((error) =>
                        of(WishlistActions.removeFromWishlistFailure({
                            error: error.message || 'Failed to remove from wishlist'
                        }))
                    )
                );
            })
        )
    );

    // Toast effects
    addToWishlistSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WishlistActions.addToWishlistSuccess),
            tap(() => {
                this.toastService.showSuccess(
                    this.translationService.translate('productDetails.addedToWishlist')
                );
            })
        ),
        { dispatch: false }
    );

    addToWishlistFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WishlistActions.addToWishlistFailure),
            tap(({ error }) => {
                const message = error.includes('already in wishlist')
                    ? this.translationService.translate('productDetails.alreadyInWishlist')
                    : this.translationService.translate('productDetails.addToWishlistError');
                this.toastService.showError(message);
            })
        ),
        { dispatch: false }
    );

    removeFromWishlistSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WishlistActions.removeFromWishlistSuccess),
            tap(() => {
                this.toastService.showSuccess(
                    this.translationService.translate('productDetails.removedFromWishlist')
                );
            })
        ),
        { dispatch: false }
    );

    removeFromWishlistFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WishlistActions.removeFromWishlistFailure),
            tap(() => {
                this.toastService.showError(
                    this.translationService.translate('productDetails.removeFromWishlistError')
                );
            })
        ),
        { dispatch: false }
    );

    private async loadUserWishlist(userId: string): Promise<WishlistItem[]> {
        try {
            // Get wishlist items using direct Supabase client
            const { data: wishlistData, error: wishlistError } = await this.supabaseService.client
                .from('wishlist')
                .select('*')
                .eq('user_id', userId);

            if (wishlistError) {
                throw wishlistError;
            }

            if (!wishlistData || wishlistData.length === 0) {
                return [];
            }

            // Load product details for each wishlist item
            const wishlistItems: WishlistItem[] = [];

            for (const wishlistItem of wishlistData) {
                try {
                    const productData = await this.supabaseService.getTable('products', {
                        id: wishlistItem.product_id
                    });

                    if (productData && productData.length > 0) {
                        const product = productData[0];

                        const item: WishlistItem = {
                            id: wishlistItem.id,
                            userId: wishlistItem.user_id,
                            productId: wishlistItem.product_id,
                            createdAt: wishlistItem.created_at,
                            updatedAt: wishlistItem.updated_at,
                            product: {
                                id: product.id,
                                name: product.name,
                                slug: product.sku.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                                description: product.description,
                                price: product.price,
                                originalPrice: product.original_price,
                                currency: product.currency,
                                sku: product.sku,
                                brand: product.brand,
                                categoryId: product.category_id,
                                categoryName: 'Uncategorized',
                                images: product.images.map(img => ({
                                    url: img.url,
                                    alt: img.alt,
                                    is_primary: img.is_primary,
                                    order: img.order,
                                    type: img.type === 'thumbnail' || img.type === 'technical' ? 'gallery' : img.type as 'main' | 'gallery'
                                })),
                                isActive: product.is_active,
                                isFeatured: product.is_featured,
                                stockQuantity: product.stock_quantity,
                                availability: this.determineAvailability(product.stock_status),
                                rating: product.rating_average || 0,
                                reviewCount: product.rating_count || 0
                            }
                        };

                        wishlistItems.push(item);
                    }
                } catch (productError) {
                    console.warn('Failed to load product details for wishlist item:', productError);
                    // Still add the wishlist item without product details
                    const item: WishlistItem = {
                        id: wishlistItem.id,
                        userId: wishlistItem.user_id,
                        productId: wishlistItem.product_id,
                        createdAt: wishlistItem.created_at,
                        updatedAt: wishlistItem.updated_at
                    };
                    wishlistItems.push(item);
                }
            }

            return wishlistItems;
        } catch (error) {
            console.error('Error loading wishlist:', error);
            throw error;
        }
    }

    private async addProductToWishlist(userId: string, productId: string): Promise<WishlistItem> {
        try {
            // Check if product is already in wishlist
            const { data: existingItems, error: checkError } = await this.supabaseService.client
                .from('wishlist')
                .select('*')
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (checkError) {
                throw checkError;
            }

            if (existingItems && existingItems.length > 0) {
                throw new Error('Product is already in wishlist');
            }

            // Add to wishlist
            const wishlistData = {
                user_id: userId,
                product_id: productId
            };

            const { data: createdItems, error: insertError } = await this.supabaseService.client
                .from('wishlist')
                .insert(wishlistData)
                .select();

            if (insertError) {
                throw insertError;
            }

            if (!createdItems || createdItems.length === 0) {
                throw new Error('Failed to add product to wishlist');
            }

            const createdItem = createdItems[0];

            // Load product details
            const productData = await this.supabaseService.getTable('products', {
                id: productId
            });

            let product = undefined;
            if (productData && productData.length > 0) {
                const productDetails = productData[0];

                // Get category name if category_id exists
                let categoryName = undefined;
                if (productDetails.category_id) {
                    const categoryData = await this.supabaseService.getTable('categories', {
                        id: productDetails.category_id
                    });
                    categoryName = categoryData && categoryData.length > 0 ? categoryData[0].name : undefined;
                }

                product = {
                    id: productDetails.id,
                    name: productDetails.name,
                    slug: productDetails.sku.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    description: productDetails.description,
                    price: productDetails.price,
                    originalPrice: productDetails.original_price,
                    currency: productDetails.currency,
                    sku: productDetails.sku,
                    brand: productDetails.brand,
                    categoryId: productDetails.category_id,
                    categoryName,
                    images: productDetails.images.map(img => ({
                        url: img.url,
                        alt: img.alt,
                        is_primary: img.is_primary,
                        order: img.order,
                        type: img.type === 'thumbnail' || img.type === 'technical' ? 'gallery' : img.type as 'main' | 'gallery'
                    })),
                    isActive: productDetails.is_active,
                    isFeatured: productDetails.is_featured,
                    stockQuantity: productDetails.stock_quantity,
                    availability: this.determineAvailability(productDetails.stock_status),
                    rating: productDetails.rating_average || 0,
                    reviewCount: productDetails.rating_count || 0
                };
            }

            const wishlistItem: WishlistItem = {
                id: createdItem.id,
                userId: createdItem.user_id,
                productId: createdItem.product_id,
                createdAt: createdItem.created_at,
                updatedAt: createdItem.updated_at,
                product
            };

            return wishlistItem;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            throw error;
        }
    }

    private async removeProductFromWishlist(userId: string, productId: string): Promise<void> {
        try {
            // Remove from wishlist
            const { error } = await this.supabaseService.client
                .from('wishlist')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            throw error;
        }
    }

    private determineAvailability(stockStatus: string): 'available' | 'limited' | 'out-of-stock' {
        if (stockStatus === 'out_of_stock') {
            return 'out-of-stock';
        } else if (stockStatus === 'low_stock') {
            return 'limited';
        } else {
            return 'available';
        }
    }
} 