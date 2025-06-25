import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import * as ReviewsActions from './reviews.actions';
import { Review } from '../../../../shared/models/review.model';

@Injectable()
export class ReviewsEffects {

    constructor(
        private actions$: Actions,
        private supabaseService: SupabaseService,
        private toastService: ToastService,
        private translationService: TranslationService
    ) { }

    loadReviews$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewsActions.loadReviews),
            switchMap(() => {
                return this.supabaseService.client
                    .from('reviews')
                    .select(`
                        *,
                        product:products(
                            name,
                            sku
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .then(({ data: reviews, error }) => {

                        if (error) {
                            throw error;
                        }

                        // Map database fields to Review model
                        const mappedReviews: Review[] = (reviews || []).map((review: any) => {
                            return {
                                id: review.id,
                                userId: review.user_id,
                                productId: review.product_id,
                                orderId: review.order_id,
                                orderItemId: review.order_item_id,
                                rating: review.rating,
                                title: review.title || '',
                                comment: review.comment || '',
                                isVerifiedPurchase: review.is_verified_purchase,
                                isApproved: review.is_approved,
                                adminResponse: review.admin_response,
                                helpfulCount: review.helpful_count || 0,
                                reportedCount: review.reported_count || 0,
                                status: review.status,
                                createdAt: review.created_at,
                                updatedAt: review.updated_at,
                                user: {
                                    firstName: 'User',
                                    lastName: review.user_id?.substring(0, 8) || 'Unknown'
                                },
                                product: {
                                    name: review.product?.name || 'Unknown Product'
                                }
                            };
                        });
                        return mappedReviews;
                    });
            }),
            map((reviews: Review[]) => {
                return ReviewsActions.loadReviewsSuccess({ reviews });
            }),
            catchError((error: any) => {
                return of(ReviewsActions.loadReviewsFailure({ error: error.message }));
            })
        )
    );

    loadReview$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewsActions.loadReview),
            switchMap(({ reviewId }) =>
                this.supabaseService.client
                    .from('reviews')
                    .select(`
                        *,
                        product:products(
                            name,
                            sku
                        )
                    `)
                    .eq('id', reviewId)
                    .single()
                    .then(({ data: review, error }) => {
                        if (error) throw error;
                        if (!review) throw new Error('Review not found');

                        // Map database fields to Review model
                        const mappedReview: Review = {
                            id: review.id,
                            userId: review.user_id,
                            productId: review.product_id,
                            orderId: review.order_id,
                            orderItemId: review.order_item_id,
                            rating: review.rating,
                            title: review.title || '',
                            comment: review.comment || '',
                            isVerifiedPurchase: review.is_verified_purchase,
                            isApproved: review.is_approved,
                            adminResponse: review.admin_response,
                            helpfulCount: review.helpful_count || 0,
                            reportedCount: review.reported_count || 0,
                            status: review.status,
                            createdAt: review.created_at,
                            updatedAt: review.updated_at,
                            user: {
                                firstName: 'User',
                                lastName: review.user_id?.substring(0, 8) || 'Unknown'
                            },
                            product: {
                                name: review.product?.name || 'Unknown Product'
                            }
                        };

                        return mappedReview;
                    })
            ),
            map((review: Review) => ReviewsActions.loadReviewSuccess({ review })),
            catchError((error: any) => of(ReviewsActions.loadReviewFailure({ error: error.message })))
        )
    );

    updateReviewStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewsActions.updateReviewStatus),
            switchMap(({ reviewId, status }) =>
                this.supabaseService.client
                    .from('reviews')
                    .update({ status: status as any })
                    .eq('id', reviewId)
                    .then(() => ({ reviewId, status }))
            ),
            map(({ reviewId, status }) => {
                this.toastService.showSuccess(
                    this.translationService.translate('admin.reviewsForm.reviewUpdated')
                );
                return ReviewsActions.updateReviewStatusSuccess({ reviewId, status });
            }),
            catchError((error: any) => {
                this.toastService.showError(
                    this.translationService.translate('admin.reviewsForm.reviewError'),
                    error.message
                );
                return of(ReviewsActions.updateReviewStatusFailure({ error: error.message }));
            })
        )
    );

    approveReview$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewsActions.approveReview),
            switchMap(({ reviewId }) =>
                // First, get the review data to find product ID and rating
                this.supabaseService.client
                    .from('reviews')
                    .select('product_id, rating')
                    .eq('id', reviewId)
                    .single()
                    .then(({ data: review, error }) => {
                        if (error) throw error;
                        if (!review) throw new Error('Review not found');

                        return { reviewId, productId: review.product_id, rating: review.rating };
                    })
                    .then(({ reviewId, productId, rating }) =>
                        // Update the review to mark it as approved
                        this.supabaseService.client
                            .from('reviews')
                            .update({ is_approved: true })
                            .eq('id', reviewId)
                            .then(() => ({ reviewId, productId, rating }))
                    )
                    .then(({ reviewId, productId, rating }) =>
                        // Get current product rating statistics
                        this.supabaseService.client
                            .from('products')
                            .select('rating_count, rating_average')
                            .eq('id', productId)
                            .single()
                            .then(({ data: product, error }) => {
                                if (error) throw error;
                                if (!product) throw new Error('Product not found');

                                return { reviewId, productId, rating, currentCount: product.rating_count || 0, currentAverage: product.rating_average || 0 };
                            })
                    )
                    .then(({ reviewId, productId, rating, currentCount, currentAverage }) => {
                        // Calculate new average rating
                        const newCount = currentCount + 1;
                        const newAverage = ((currentAverage * currentCount) + rating) / newCount;

                        // Update product rating statistics
                        return this.supabaseService.client
                            .from('products')
                            .update({
                                rating_count: newCount,
                                rating_average: Math.round(newAverage * 10) / 10 // Round to 1 decimal place
                            })
                            .eq('id', productId)
                            .then(() => ({ reviewId, productId, rating }));
                    })
            ),
            map(({ reviewId }) => {
                this.toastService.showSuccess(
                    this.translationService.translate('admin.reviewsForm.reviewApproved')
                );
                return ReviewsActions.approveReviewSuccess({ reviewId });
            }),
            catchError((error: any) => {
                this.toastService.showError(
                    this.translationService.translate('admin.reviewsForm.reviewError'),
                    error.message
                );
                return of(ReviewsActions.approveReviewFailure({ error: error.message }));
            })
        )
    );

    rejectReview$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewsActions.rejectReview),
            switchMap(({ reviewId }) =>
                // First, get the review data to find product ID, rating, and current approval status
                this.supabaseService.client
                    .from('reviews')
                    .select('product_id, rating, is_approved')
                    .eq('id', reviewId)
                    .single()
                    .then(({ data: review, error }) => {
                        if (error) throw error;
                        if (!review) throw new Error('Review not found');

                        return { reviewId, productId: review.product_id, rating: review.rating, wasApproved: review.is_approved };
                    })
                    .then(({ reviewId, productId, rating, wasApproved }) =>
                        // Update the review to mark it as not approved
                        this.supabaseService.client
                            .from('reviews')
                            .update({ is_approved: false })
                            .eq('id', reviewId)
                            .then(() => ({ reviewId, productId, rating, wasApproved }))
                    )
                    .then(({ reviewId, productId, rating, wasApproved }) => {
                        // Only update product statistics if the review was previously approved
                        if (!wasApproved) {
                            return { reviewId, productId, rating };
                        }

                        // Get current product rating statistics
                        return this.supabaseService.client
                            .from('products')
                            .select('rating_count, rating_average')
                            .eq('id', productId)
                            .single()
                            .then(({ data: product, error }) => {
                                if (error) throw error;
                                if (!product) throw new Error('Product not found');

                                const currentCount = product.rating_count || 0;
                                const currentAverage = product.rating_average || 0;

                                // Calculate new average rating (remove this review's contribution)
                                const newCount = Math.max(0, currentCount - 1);
                                let newAverage = 0;

                                if (newCount > 0) {
                                    newAverage = ((currentAverage * currentCount) - rating) / newCount;
                                }

                                // Update product rating statistics
                                return this.supabaseService.client
                                    .from('products')
                                    .update({
                                        rating_count: newCount,
                                        rating_average: Math.round(newAverage * 10) / 10 // Round to 1 decimal place
                                    })
                                    .eq('id', productId)
                                    .then(() => ({ reviewId, productId, rating }));
                            });
                    })
            ),
            map(({ reviewId }) => {
                this.toastService.showSuccess(
                    this.translationService.translate('admin.reviewsForm.reviewRejected')
                );
                return ReviewsActions.rejectReviewSuccess({ reviewId });
            }),
            catchError((error: any) => {
                this.toastService.showError(
                    this.translationService.translate('admin.reviewsForm.reviewError'),
                    error.message
                );
                return of(ReviewsActions.rejectReviewFailure({ error: error.message }));
            })
        )
    );

    updateReview$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewsActions.updateReview),
            switchMap(({ reviewId, review }) => {
                // Map Review model fields back to database fields
                const updateData: any = {};
                if (review.rating !== undefined) updateData.rating = review.rating;
                if (review.title !== undefined) updateData.title = review.title;
                if (review.comment !== undefined) updateData.comment = review.comment;
                if (review.adminResponse !== undefined) updateData.admin_response = review.adminResponse;
                updateData.updated_at = new Date().toISOString();

                return this.supabaseService.client
                    .from('reviews')
                    .update(updateData)
                    .eq('id', reviewId)
                    .select()
                    .single()
                    .then(({ data: updatedReview, error }) => {
                        if (error) throw error;
                        if (!updatedReview) throw new Error('Review not found');

                        // Map database fields back to Review model
                        const mappedReview: Review = {
                            id: updatedReview.id,
                            userId: updatedReview.user_id,
                            productId: updatedReview.product_id,
                            orderId: updatedReview.order_id,
                            orderItemId: updatedReview.order_item_id,
                            rating: updatedReview.rating,
                            title: updatedReview.title || '',
                            comment: updatedReview.comment || '',
                            isVerifiedPurchase: updatedReview.is_verified_purchase,
                            isApproved: updatedReview.is_approved,
                            adminResponse: updatedReview.admin_response,
                            helpfulCount: updatedReview.helpful_count || 0,
                            reportedCount: updatedReview.reported_count || 0,
                            status: updatedReview.status,
                            createdAt: updatedReview.created_at,
                            updatedAt: updatedReview.updated_at,
                            user: {
                                firstName: 'User',
                                lastName: updatedReview.user_id?.substring(0, 8) || 'Unknown'
                            },
                            product: {
                                name: 'Unknown Product' // We don't have product data in this query
                            }
                        };

                        return mappedReview;
                    });
            }),
            map((review: Review) => {
                this.toastService.showSuccess(
                    this.translationService.translate('admin.reviewsForm.reviewUpdated')
                );
                return ReviewsActions.updateReviewSuccess({ review });
            }),
            catchError((error: any) => {
                this.toastService.showError(
                    this.translationService.translate('admin.reviewsForm.reviewError'),
                    error.message
                );
                return of(ReviewsActions.updateReviewFailure({ error: error.message }));
            })
        )
    );

    deleteReview$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReviewsActions.deleteReview),
            switchMap(({ reviewId }) =>
                // First, get the review data to find product ID, rating, and approval status
                this.supabaseService.client
                    .from('reviews')
                    .select('product_id, rating, is_approved')
                    .eq('id', reviewId)
                    .single()
                    .then(({ data: review, error }) => {
                        if (error) throw error;
                        if (!review) throw new Error('Review not found');

                        return { reviewId, productId: review.product_id, rating: review.rating, wasApproved: review.is_approved };
                    })
                    .then(({ reviewId, productId, rating, wasApproved }) =>
                        // Delete the review
                        this.supabaseService.client
                            .from('reviews')
                            .delete()
                            .eq('id', reviewId)
                            .then(() => ({ reviewId, productId, rating, wasApproved }))
                    )
                    .then(({ reviewId, productId, rating, wasApproved }) => {
                        // Only update product statistics if the review was approved
                        if (!wasApproved) {
                            return { reviewId, productId, rating };
                        }

                        // Get current product rating statistics
                        return this.supabaseService.client
                            .from('products')
                            .select('rating_count, rating_average')
                            .eq('id', productId)
                            .single()
                            .then(({ data: product, error }) => {
                                if (error) throw error;
                                if (!product) throw new Error('Product not found');

                                const currentCount = product.rating_count || 0;
                                const currentAverage = product.rating_average || 0;

                                // Calculate new average rating (remove this review's contribution)
                                const newCount = Math.max(0, currentCount - 1);
                                let newAverage = 0;

                                if (newCount > 0) {
                                    newAverage = ((currentAverage * currentCount) - rating) / newCount;
                                }

                                // Update product rating statistics
                                return this.supabaseService.client
                                    .from('products')
                                    .update({
                                        rating_count: newCount,
                                        rating_average: Math.round(newAverage * 10) / 10 // Round to 1 decimal place
                                    })
                                    .eq('id', productId)
                                    .then(() => ({ reviewId, productId, rating }));
                            });
                    })
            ),
            map(({ reviewId }) => {
                this.toastService.showSuccess(
                    this.translationService.translate('admin.reviewsForm.reviewDeleted')
                );
                return ReviewsActions.deleteReviewSuccess({ reviewId });
            }),
            catchError((error: any) => {
                this.toastService.showError(
                    this.translationService.translate('admin.reviewsForm.reviewError'),
                    error.message
                );
                return of(ReviewsActions.deleteReviewFailure({ error: error.message }));
            })
        )
    );
} 