import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Product } from '../../product-list/product-list.component';

// Interface for display purposes in product reviews component
export interface ProductReview {
    id: string;
    userName: string;
    userAvatar: string;
    rating: number;
    title: string;
    comment: string;
    date: Date;
    verified: boolean;
    helpful: number;
}

export const ProductDetailsActions = createActionGroup({
    source: 'Product Details',
    events: {
        'Load Product': props<{ productId: string }>(),
        'Load Product Success': props<{ product: Product }>(),
        'Load Product Failure': props<{ error: string }>(),
        'Clear Product': emptyProps(),

        // Product Reviews Actions
        'Load Product Reviews': props<{ productId: string }>(),
        'Load Product Reviews Success': props<{ reviews: ProductReview[] }>(),
        'Load Product Reviews Failure': props<{ error: string }>(),

        'Mark Review Helpful': props<{ reviewId: string; productId: string }>(),
        'Mark Review Helpful Success': props<{ reviewId: string; newHelpfulCount: number }>(),
        'Mark Review Helpful Failure': props<{ error: string }>(),

        'Submit Review': props<{ reviewData: any }>(),
        'Submit Review Success': props<{ review: ProductReview }>(),
        'Submit Review Failure': props<{ error: string }>(),
    }
}); 