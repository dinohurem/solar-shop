import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { ProductDetailsActions, ProductReview } from './product-details.actions';
import { ProductListService } from '../../product-list/services/product-list.service';
import { SupabaseService } from '../../../../../services/supabase.service';
import { selectCurrentUser } from '../../../../../core/auth/store/auth.selectors';
import { Store } from '@ngrx/store';
import { withLatestFrom } from 'rxjs';

@Injectable()
export class ProductDetailsEffects {
    private actions$ = inject(Actions);
    private productListService = inject(ProductListService);
    private supabaseService = inject(SupabaseService);
    private store = inject(Store);

    loadProduct$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductDetailsActions.loadProduct),
            switchMap(({ productId }) =>
                this.productListService.getProductById(productId).pipe(
                    map(product => {
                        if (product) {
                            return ProductDetailsActions.loadProductSuccess({ product });
                        } else {
                            return ProductDetailsActions.loadProductFailure({ error: 'Product not found' });
                        }
                    }),
                    catchError((error: any) =>
                        of(ProductDetailsActions.loadProductFailure({
                            error: error.message || 'Failed to load product'
                        }))
                    )
                )
            )
        )
    );

    // Product Reviews Effects
    loadProductReviews$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductDetailsActions.loadProductReviews),
            switchMap(async ({ productId }) => {
                try {
                    // Get all reviews for this product using the clean getTable approach
                    const reviews = await this.supabaseService.getTable('reviews');

                    // Filter for this product and approved status only
                    const filteredReviews = (reviews || []).filter((review: any) => {
                        const matchesProduct = review.product_id === productId;
                        const isApproved = review.is_approved === true;
                        const isNotHidden = review.status !== 'hidden';
                        console.log(`Review ${review.id}: product_id=${review.product_id}, is_approved=${review.is_approved}, status=${review.status}, matchesProduct=${matchesProduct}, isApproved=${isApproved}, isNotHidden=${isNotHidden}`);
                        return matchesProduct && isApproved && isNotHidden;
                    });

                    const mappedReviews: ProductReview[] = filteredReviews.map((review: any) => {
                        // Extract user name from auth.users metadata
                        const userMetaData = review.user?.raw_user_meta_data || {};
                        const firstName = userMetaData.first_name || userMetaData.name?.split(' ')[0] || '';
                        const lastName = userMetaData.last_name || userMetaData.name?.split(' ').slice(1).join(' ') || '';
                        const userName = firstName && lastName ? `${firstName} ${lastName}` :
                            userMetaData.name || review.user?.email?.split('@')[0] || 'Anonymous';

                        return {
                            id: review.id,
                            userName: userName,
                            userAvatar: userMetaData.avatar_url || '/assets/images/default-avatar.png',
                            rating: review.rating,
                            title: review.title || '',
                            comment: review.comment || '',
                            date: new Date(review.created_at),
                            verified: review.is_verified_purchase,
                            helpful: review.helpful_count || 0
                        };
                    })
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

                    return ProductDetailsActions.loadProductReviewsSuccess({ reviews: mappedReviews });
                } catch (error) {
                    console.error('Error loading reviews:', error);
                    return ProductDetailsActions.loadProductReviewsFailure({
                        error: error instanceof Error ? error.message : 'Failed to load reviews'
                    });
                }
            })
        )
    );

    markReviewHelpful$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductDetailsActions.markReviewHelpful),
            withLatestFrom(this.store.select(selectCurrentUser)),
            switchMap(async ([{ reviewId, productId }, currentUser]) => {
                try {
                    // Check if user is authenticated
                    if (!currentUser) {
                        return ProductDetailsActions.markReviewHelpfulFailure({
                            error: 'User must be logged in to mark reviews as helpful'
                        });
                    }

                    // Get current helpful count
                    const { data: currentReview } = await this.supabaseService.client
                        .from('reviews')
                        .select('helpful_count')
                        .eq('id', reviewId)
                        .single();

                    if (!currentReview) {
                        return ProductDetailsActions.markReviewHelpfulFailure({
                            error: 'Review not found'
                        });
                    }

                    // Increment helpful count
                    const newHelpfulCount = (currentReview.helpful_count || 0) + 1;

                    const { error: updateError } = await this.supabaseService.client
                        .from('reviews')
                        .update({ helpful_count: newHelpfulCount })
                        .eq('id', reviewId);

                    if (updateError) {
                        console.error('Error updating helpful count:', updateError);
                        return ProductDetailsActions.markReviewHelpfulFailure({
                            error: 'Failed to update helpful count'
                        });
                    }

                    return ProductDetailsActions.markReviewHelpfulSuccess({
                        reviewId,
                        newHelpfulCount
                    });
                } catch (error) {
                    console.error('Error marking review helpful:', error);
                    return ProductDetailsActions.markReviewHelpfulFailure({
                        error: error instanceof Error ? error.message : 'Failed to mark review as helpful'
                    });
                }
            })
        )
    );

    // Auto-load reviews when product is loaded
    loadReviewsOnProductLoad$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProductDetailsActions.loadProductSuccess),
            map(({ product }) => ProductDetailsActions.loadProductReviews({ productId: product.id }))
        )
    );
} 