import { createReducer, on } from '@ngrx/store';
import { ReviewsState } from './reviews.state';
import * as ReviewsActions from './reviews.actions';

export const initialState: ReviewsState = {
    reviews: [],
    currentReview: null,
    loading: false,
    loadingReview: false,
    error: null,
    updatingStatus: false,
    updatingReview: false,
    deletingReview: false,
    approvingReview: false,
    rejectingReview: false
};

export const reviewsReducer = createReducer(
    initialState,

    // Load reviews
    on(ReviewsActions.loadReviews, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ReviewsActions.loadReviewsSuccess, (state, { reviews }) => ({
        ...state,
        reviews,
        loading: false,
        error: null
    })),

    on(ReviewsActions.loadReviewsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Load single review
    on(ReviewsActions.loadReview, (state) => ({
        ...state,
        loadingReview: true,
        error: null
    })),

    on(ReviewsActions.loadReviewSuccess, (state, { review }) => ({
        ...state,
        currentReview: review,
        loadingReview: false,
        error: null
    })),

    on(ReviewsActions.loadReviewFailure, (state, { error }) => ({
        ...state,
        loadingReview: false,
        error
    })),

    // Update review status
    on(ReviewsActions.updateReviewStatus, (state) => ({
        ...state,
        updatingStatus: true,
        error: null
    })),

    on(ReviewsActions.updateReviewStatusSuccess, (state, { reviewId, status }) => ({
        ...state,
        reviews: state.reviews.map(review =>
            review.id === reviewId ? { ...review, status: status as any } : review
        ),
        currentReview: state.currentReview?.id === reviewId
            ? { ...state.currentReview, status: status as any }
            : state.currentReview,
        updatingStatus: false,
        error: null
    })),

    on(ReviewsActions.updateReviewStatusFailure, (state, { error }) => ({
        ...state,
        updatingStatus: false,
        error
    })),

    // Approve review
    on(ReviewsActions.approveReview, (state) => ({
        ...state,
        approvingReview: true,
        error: null
    })),

    on(ReviewsActions.approveReviewSuccess, (state, { reviewId }) => ({
        ...state,
        reviews: state.reviews.map(review =>
            review.id === reviewId ? { ...review, is_approved: true } : review
        ),
        currentReview: state.currentReview?.id === reviewId
            ? { ...state.currentReview, is_approved: true }
            : state.currentReview,
        approvingReview: false,
        error: null
    })),

    on(ReviewsActions.approveReviewFailure, (state, { error }) => ({
        ...state,
        approvingReview: false,
        error
    })),

    // Reject review
    on(ReviewsActions.rejectReview, (state) => ({
        ...state,
        rejectingReview: true,
        error: null
    })),

    on(ReviewsActions.rejectReviewSuccess, (state, { reviewId }) => ({
        ...state,
        reviews: state.reviews.map(review =>
            review.id === reviewId ? { ...review, is_approved: false } : review
        ),
        currentReview: state.currentReview?.id === reviewId
            ? { ...state.currentReview, is_approved: false }
            : state.currentReview,
        rejectingReview: false,
        error: null
    })),

    on(ReviewsActions.rejectReviewFailure, (state, { error }) => ({
        ...state,
        rejectingReview: false,
        error
    })),

    // Update review content
    on(ReviewsActions.updateReview, (state) => ({
        ...state,
        updatingReview: true,
        error: null
    })),

    on(ReviewsActions.updateReviewSuccess, (state, { review }) => ({
        ...state,
        reviews: state.reviews.map(r => r.id === review.id ? review : r),
        currentReview: state.currentReview?.id === review.id ? review : state.currentReview,
        updatingReview: false,
        error: null
    })),

    on(ReviewsActions.updateReviewFailure, (state, { error }) => ({
        ...state,
        updatingReview: false,
        error
    })),

    // Delete review
    on(ReviewsActions.deleteReview, (state) => ({
        ...state,
        deletingReview: true,
        error: null
    })),

    on(ReviewsActions.deleteReviewSuccess, (state, { reviewId }) => ({
        ...state,
        reviews: state.reviews.filter(review => review.id !== reviewId),
        currentReview: state.currentReview?.id === reviewId ? null : state.currentReview,
        deletingReview: false,
        error: null
    })),

    on(ReviewsActions.deleteReviewFailure, (state, { error }) => ({
        ...state,
        deletingReview: false,
        error
    })),

    // Clear current review
    on(ReviewsActions.clearCurrentReview, (state) => ({
        ...state,
        currentReview: null
    }))
); 