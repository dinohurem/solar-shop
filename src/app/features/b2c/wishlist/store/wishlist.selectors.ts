import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WishlistState } from '../../../../shared/models/wishlist.model';

export const selectWishlistState = createFeatureSelector<WishlistState>('wishlist');

export const selectWishlistItems = createSelector(
    selectWishlistState,
    (state: WishlistState) => state.items
);

export const selectWishlistLoading = createSelector(
    selectWishlistState,
    (state: WishlistState) => state.loading
);

export const selectWishlistError = createSelector(
    selectWishlistState,
    (state: WishlistState) => state.error
);

export const selectAddingToWishlist = createSelector(
    selectWishlistState,
    (state: WishlistState) => state.addingToWishlist
);

export const selectRemovingFromWishlist = createSelector(
    selectWishlistState,
    (state: WishlistState) => state.removingFromWishlist
);

export const selectWishlistItemCount = createSelector(
    selectWishlistItems,
    (items) => items.length
);

export const selectIsProductInWishlist = (productId: string) => createSelector(
    selectWishlistItems,
    (items) => items.some(item => item.productId === productId)
);

export const selectWishlistItemByProductId = (productId: string) => createSelector(
    selectWishlistItems,
    (items) => items.find(item => item.productId === productId)
); 