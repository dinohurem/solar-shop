import { createReducer, on } from '@ngrx/store';
import { Product } from '../../product-list/product-list.component';
import { ProductDetailsActions, ProductReview } from './product-details.actions';

export interface ProductDetailsState {
    product: Product | null;
    loading: boolean;
    error: string | null;

    // Product Reviews State
    reviews: ProductReview[];
    reviewsLoading: boolean;
    reviewsError: string | null;
    markingHelpful: { [reviewId: string]: boolean };
}

const initialState: ProductDetailsState = {
    product: null,
    loading: false,
    error: null,

    // Product Reviews State
    reviews: [],
    reviewsLoading: false,
    reviewsError: null,
    markingHelpful: {}
};

export const productDetailsReducer = createReducer(
    initialState,

    on(ProductDetailsActions.loadProduct, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProductDetailsActions.loadProductSuccess, (state, { product }) => ({
        ...state,
        product,
        loading: false,
        error: null
    })),

    on(ProductDetailsActions.loadProductFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(ProductDetailsActions.clearProduct, () => initialState),

    // Product Reviews Reducers
    on(ProductDetailsActions.loadProductReviews, (state) => ({
        ...state,
        reviewsLoading: true,
        reviewsError: null
    })),

    on(ProductDetailsActions.loadProductReviewsSuccess, (state, { reviews }) => ({
        ...state,
        reviews,
        reviewsLoading: false,
        reviewsError: null
    })),

    on(ProductDetailsActions.loadProductReviewsFailure, (state, { error }) => ({
        ...state,
        reviewsLoading: false,
        reviewsError: error
    })),

    on(ProductDetailsActions.markReviewHelpful, (state, { reviewId }) => ({
        ...state,
        markingHelpful: {
            ...state.markingHelpful,
            [reviewId]: true
        }
    })),

    on(ProductDetailsActions.markReviewHelpfulSuccess, (state, { reviewId, newHelpfulCount }) => ({
        ...state,
        reviews: state.reviews.map(review =>
            review.id === reviewId
                ? { ...review, helpful: newHelpfulCount }
                : review
        ),
        markingHelpful: {
            ...state.markingHelpful,
            [reviewId]: false
        }
    })),

    on(ProductDetailsActions.markReviewHelpfulFailure, (state, { error }) => ({
        ...state,
        markingHelpful: Object.keys(state.markingHelpful).reduce((acc, reviewId) => ({
            ...acc,
            [reviewId]: false
        }), {})
    })),

    on(ProductDetailsActions.submitReviewSuccess, (state, { review }) => ({
        ...state,
        reviews: [review, ...state.reviews]
    }))
); 