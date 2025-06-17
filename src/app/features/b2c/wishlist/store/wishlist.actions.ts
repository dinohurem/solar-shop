import { createAction, props } from '@ngrx/store';
import { WishlistItem } from '../../../../shared/models/wishlist.model';

// Load wishlist actions
export const loadWishlist = createAction('[Wishlist] Load Wishlist');

export const loadWishlistSuccess = createAction(
    '[Wishlist] Load Wishlist Success',
    props<{ items: WishlistItem[] }>()
);

export const loadWishlistFailure = createAction(
    '[Wishlist] Load Wishlist Failure',
    props<{ error: string }>()
);

// Add to wishlist actions
export const addToWishlist = createAction(
    '[Wishlist] Add to Wishlist',
    props<{ productId: string }>()
);

export const addToWishlistSuccess = createAction(
    '[Wishlist] Add to Wishlist Success',
    props<{ item: WishlistItem }>()
);

export const addToWishlistFailure = createAction(
    '[Wishlist] Add to Wishlist Failure',
    props<{ error: string }>()
);

// Remove from wishlist actions
export const removeFromWishlist = createAction(
    '[Wishlist] Remove from Wishlist',
    props<{ productId: string }>()
);

export const removeFromWishlistSuccess = createAction(
    '[Wishlist] Remove from Wishlist Success',
    props<{ productId: string }>()
);

export const removeFromWishlistFailure = createAction(
    '[Wishlist] Remove from Wishlist Failure',
    props<{ error: string }>()
);

// Check if product is in wishlist
export const checkProductInWishlist = createAction(
    '[Wishlist] Check Product in Wishlist',
    props<{ productId: string }>()
);

// Clear wishlist
export const clearWishlist = createAction('[Wishlist] Clear Wishlist'); 