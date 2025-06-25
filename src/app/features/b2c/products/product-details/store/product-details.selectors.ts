import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductDetailsState } from './product-details.reducer';

export const selectProductDetailsState = createFeatureSelector<ProductDetailsState>('productDetails');

export const selectProduct = createSelector(
    selectProductDetailsState,
    (state) => state.product
);

export const selectIsLoading = createSelector(
    selectProductDetailsState,
    (state) => state.loading
);

export const selectError = createSelector(
    selectProductDetailsState,
    (state) => state.error
);

// Product Reviews Selectors
export const selectProductReviews = createSelector(
    selectProductDetailsState,
    (state) => state.reviews
);

export const selectProductReviewsLoading = createSelector(
    selectProductDetailsState,
    (state) => state.reviewsLoading
);

export const selectProductReviewsError = createSelector(
    selectProductDetailsState,
    (state) => state.reviewsError
);

export const selectMarkingHelpful = createSelector(
    selectProductDetailsState,
    (state) => state.markingHelpful
);

export const selectIsMarkingHelpful = (reviewId: string) => createSelector(
    selectMarkingHelpful,
    (markingHelpful) => markingHelpful[reviewId] || false
);

// Computed selectors for reviews
export const selectAverageRating = createSelector(
    selectProductReviews,
    (reviews) => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round((sum / reviews.length) * 10) / 10;
    }
);

export const selectReviewCount = createSelector(
    selectProductReviews,
    (reviews) => reviews.length
); 