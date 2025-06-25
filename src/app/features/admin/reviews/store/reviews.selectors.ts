import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReviewsState } from './reviews.state';

export const selectReviewsState = createFeatureSelector<ReviewsState>('reviews');

export const selectReviews = createSelector(
    selectReviewsState,
    (state) => state.reviews
);

export const selectCurrentReview = createSelector(
    selectReviewsState,
    (state) => state.currentReview
);

export const selectReviewsLoading = createSelector(
    selectReviewsState,
    (state) => state.loading
);

export const selectReviewLoading = createSelector(
    selectReviewsState,
    (state) => state.loadingReview
);

export const selectReviewsError = createSelector(
    selectReviewsState,
    (state) => state.error
);

export const selectUpdatingStatus = createSelector(
    selectReviewsState,
    (state) => state.updatingStatus
);

export const selectUpdatingReview = createSelector(
    selectReviewsState,
    (state) => state.updatingReview
);

export const selectDeletingReview = createSelector(
    selectReviewsState,
    (state) => state.deletingReview
);

export const selectApprovingReview = createSelector(
    selectReviewsState,
    (state) => state.approvingReview
);

export const selectRejectingReview = createSelector(
    selectReviewsState,
    (state) => state.rejectingReview
); 