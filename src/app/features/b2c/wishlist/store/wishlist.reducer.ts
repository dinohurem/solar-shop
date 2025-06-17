import { createReducer, on } from '@ngrx/store';
import { WishlistState } from '../../../../shared/models/wishlist.model';
import * as WishlistActions from './wishlist.actions';

export const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null,
    addingToWishlist: false,
    removingFromWishlist: null
};

export const wishlistReducer = createReducer(
    initialState,

    // Load wishlist
    on(WishlistActions.loadWishlist, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(WishlistActions.loadWishlistSuccess, (state, { items }) => ({
        ...state,
        items,
        loading: false,
        error: null
    })),

    on(WishlistActions.loadWishlistFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Add to wishlist
    on(WishlistActions.addToWishlist, (state) => ({
        ...state,
        addingToWishlist: true,
        error: null
    })),

    on(WishlistActions.addToWishlistSuccess, (state, { item }) => ({
        ...state,
        items: [...state.items, item],
        addingToWishlist: false,
        error: null
    })),

    on(WishlistActions.addToWishlistFailure, (state, { error }) => ({
        ...state,
        addingToWishlist: false,
        error
    })),

    // Remove from wishlist
    on(WishlistActions.removeFromWishlist, (state, { productId }) => ({
        ...state,
        removingFromWishlist: productId,
        error: null
    })),

    on(WishlistActions.removeFromWishlistSuccess, (state, { productId }) => ({
        ...state,
        items: state.items.filter(item => item.productId !== productId),
        removingFromWishlist: null,
        error: null
    })),

    on(WishlistActions.removeFromWishlistFailure, (state, { error }) => ({
        ...state,
        removingFromWishlist: null,
        error
    })),

    // Clear wishlist
    on(WishlistActions.clearWishlist, (state) => ({
        ...state,
        items: [],
        loading: false,
        error: null,
        addingToWishlist: false,
        removingFromWishlist: null
    }))
); 