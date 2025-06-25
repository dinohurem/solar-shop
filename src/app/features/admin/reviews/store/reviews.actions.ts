import { createAction, props } from '@ngrx/store';
import { Review } from '../../../../shared/models/review.model';

// Load reviews actions
export const loadReviews = createAction('[Admin Reviews] Load Reviews');

export const loadReviewsSuccess = createAction(
    '[Admin Reviews] Load Reviews Success',
    props<{ reviews: Review[] }>()
);

export const loadReviewsFailure = createAction(
    '[Admin Reviews] Load Reviews Failure',
    props<{ error: string }>()
);

// Load single review actions
export const loadReview = createAction(
    '[Admin Reviews] Load Review',
    props<{ reviewId: string }>()
);

export const loadReviewSuccess = createAction(
    '[Admin Reviews] Load Review Success',
    props<{ review: Review }>()
);

export const loadReviewFailure = createAction(
    '[Admin Reviews] Load Review Failure',
    props<{ error: string }>()
);

// Update review status actions
export const updateReviewStatus = createAction(
    '[Admin Reviews] Update Review Status',
    props<{ reviewId: string; status: 'approved' | 'rejected' | 'hidden' }>()
);

export const updateReviewStatusSuccess = createAction(
    '[Admin Reviews] Update Review Status Success',
    props<{ reviewId: string; status: 'approved' | 'rejected' | 'hidden' }>()
);

export const updateReviewStatusFailure = createAction(
    '[Admin Reviews] Update Review Status Failure',
    props<{ error: string }>()
);

// Approve/Reject review actions
export const approveReview = createAction(
    '[Admin Reviews] Approve Review',
    props<{ reviewId: string }>()
);

export const approveReviewSuccess = createAction(
    '[Admin Reviews] Approve Review Success',
    props<{ reviewId: string }>()
);

export const approveReviewFailure = createAction(
    '[Admin Reviews] Approve Review Failure',
    props<{ error: string }>()
);

export const rejectReview = createAction(
    '[Admin Reviews] Reject Review',
    props<{ reviewId: string }>()
);

export const rejectReviewSuccess = createAction(
    '[Admin Reviews] Reject Review Success',
    props<{ reviewId: string }>()
);

export const rejectReviewFailure = createAction(
    '[Admin Reviews] Reject Review Failure',
    props<{ error: string }>()
);

// Update review content actions
export const updateReview = createAction(
    '[Admin Reviews] Update Review',
    props<{ reviewId: string; review: Partial<Review> }>()
);

export const updateReviewSuccess = createAction(
    '[Admin Reviews] Update Review Success',
    props<{ review: Review }>()
);

export const updateReviewFailure = createAction(
    '[Admin Reviews] Update Review Failure',
    props<{ error: string }>()
);

// Delete review actions
export const deleteReview = createAction(
    '[Admin Reviews] Delete Review',
    props<{ reviewId: string }>()
);

export const deleteReviewSuccess = createAction(
    '[Admin Reviews] Delete Review Success',
    props<{ reviewId: string }>()
);

export const deleteReviewFailure = createAction(
    '[Admin Reviews] Delete Review Failure',
    props<{ error: string }>()
);

// Clear current review
export const clearCurrentReview = createAction('[Admin Reviews] Clear Current Review'); 