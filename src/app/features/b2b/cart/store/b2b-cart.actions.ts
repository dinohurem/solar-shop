import { createAction, props } from '@ngrx/store';
import {
    B2BCartItem,
    AddToB2BCartPayload,
    UpdateB2BCartItemPayload,
    RemoveFromB2BCartPayload,
    B2BShippingInfo,
    B2BAppliedCoupon
} from '../models/b2b-cart.model';
import { Coupon } from '../../../../shared/models/coupon.model';

// Load cart
export const loadB2BCart = createAction(
    '[B2B Cart] Load Cart',
    props<{ companyId: string }>()
);

export const loadB2BCartSuccess = createAction(
    '[B2B Cart] Load Cart Success',
    props<{ items: B2BCartItem[]; companyId: string; companyName: string; appliedCoupons: B2BAppliedCoupon[]; couponDiscount: number }>()
);

export const loadB2BCartFailure = createAction(
    '[B2B Cart] Load Cart Failure',
    props<{ error: string }>()
);

// Add to cart
export const addToB2BCart = createAction(
    '[B2B Cart] Add To Cart',
    props<AddToB2BCartPayload>()
);

export const addToB2BCartSuccess = createAction(
    '[B2B Cart] Add To Cart Success',
    props<{ item: B2BCartItem }>()
);

export const addToB2BCartFailure = createAction(
    '[B2B Cart] Add To Cart Failure',
    props<{ error: string }>()
);

// Update cart item
export const updateB2BCartItem = createAction(
    '[B2B Cart] Update Cart Item',
    props<UpdateB2BCartItemPayload>()
);

export const updateB2BCartItemSuccess = createAction(
    '[B2B Cart] Update Cart Item Success',
    props<{ productId: string; quantity: number }>()
);

export const updateB2BCartItemFailure = createAction(
    '[B2B Cart] Update Cart Item Failure',
    props<{ error: string }>()
);

// Remove from cart
export const removeFromB2BCart = createAction(
    '[B2B Cart] Remove From Cart',
    props<RemoveFromB2BCartPayload>()
);

export const removeFromB2BCartSuccess = createAction(
    '[B2B Cart] Remove From Cart Success',
    props<{ productId: string }>()
);

export const removeFromB2BCartFailure = createAction(
    '[B2B Cart] Remove From Cart Failure',
    props<{ error: string }>()
);

// Clear cart
export const clearB2BCart = createAction(
    '[B2B Cart] Clear Cart'
);

export const clearB2BCartSuccess = createAction(
    '[B2B Cart] Clear Cart Success'
);

export const clearB2BCartFailure = createAction(
    '[B2B Cart] Clear Cart Failure',
    props<{ error: string }>()
);

// Sync cart with server
export const syncB2BCart = createAction(
    '[B2B Cart] Sync Cart',
    props<{ companyId: string }>()
);

export const syncB2BCartSuccess = createAction(
    '[B2B Cart] Sync Cart Success',
    props<{ items: B2BCartItem[] }>()
);

export const syncB2BCartFailure = createAction(
    '[B2B Cart] Sync Cart Failure',
    props<{ error: string }>()
);

// Order completion
export const b2bOrderCompleted = createAction(
    '[B2B Cart] Order Completed'
);

// Shipping info actions
export const setB2BShippingInfo = createAction(
    '[B2B Cart] Set Shipping Info',
    props<{ shippingInfo: B2BShippingInfo }>()
);

export const clearB2BShippingInfo = createAction(
    '[B2B Cart] Clear Shipping Info'
);

// Error handling
export const clearB2BCartError = createAction(
    '[B2B Cart] Clear Error'
);

// Sidebar visibility actions
export const toggleB2BCartSidebar = createAction(
    '[B2B Cart] Toggle Sidebar'
);

export const openB2BCartSidebar = createAction(
    '[B2B Cart] Open Sidebar'
);

export const closeB2BCartSidebar = createAction(
    '[B2B Cart] Close Sidebar'
);

// Coupon Actions
export const applyB2BCoupon = createAction(
    '[B2B Cart] Apply Coupon',
    props<{ code: string; companyId: string }>()
);

export const applyB2BCouponSuccess = createAction(
    '[B2B Cart] Apply Coupon Success',
    props<{ coupon: Coupon; discount: number }>()
);

export const applyB2BCouponFailure = createAction(
    '[B2B Cart] Apply Coupon Failure',
    props<{ error: string }>()
);

export const removeB2BCoupon = createAction(
    '[B2B Cart] Remove Coupon',
    props<{ couponId: string }>()
);

export const removeB2BCouponSuccess = createAction(
    '[B2B Cart] Remove Coupon Success',
    props<{ couponId: string; couponCode?: string }>()
);

export const removeB2BCouponFailure = createAction(
    '[B2B Cart] Remove Coupon Failure',
    props<{ error: string }>()
);

export const clearB2BCouponError = createAction(
    '[B2B Cart] Clear Coupon Error'
);

// Partner Offer Actions
export const addToB2BCartFromOffer = createAction(
    '[B2B Cart] Add To Cart From Partner Offer',
    props<{ 
        productId: string; 
        quantity: number; 
        companyId: string;
        partnerOfferId: string;
        partnerOfferName: string;
        partnerOfferType: 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle';
        partnerOfferDiscount: number;
        partnerOfferOriginalPrice: number;
        partnerOfferValidUntil?: string;
    }>()
);

export const addToB2BCartFromOfferSuccess = createAction(
    '[B2B Cart] Add To Cart From Partner Offer Success',
    props<{ item: B2BCartItem }>()
);

export const addToB2BCartFromOfferFailure = createAction(
    '[B2B Cart] Add To Cart From Partner Offer Failure',
    props<{ error: string }>()
);

export const addAllToB2BCartFromOffer = createAction(
    '[B2B Cart] Add All To Cart From Partner Offer',
    props<{
        products: Array<{
            productId: string;
            quantity: number;
            individualDiscount?: number;
            individualDiscountType?: 'percentage' | 'fixed_amount';
            originalPrice?: number;
        }>;
        companyId: string;
        partnerOfferId: string;
        partnerOfferName: string;
        partnerOfferType: 'percentage' | 'fixed_amount' | 'tier_based' | 'bundle';
        partnerOfferDiscount: number;
        partnerOfferValidUntil?: string;
    }>()
);

export const addAllToB2BCartFromOfferSuccess = createAction(
    '[B2B Cart] Add All To Cart From Partner Offer Success',
    props<{ items: B2BCartItem[]; addedCount: number; skippedCount: number }>()
);

export const addAllToB2BCartFromOfferFailure = createAction(
    '[B2B Cart] Add All To Cart From Partner Offer Failure',
    props<{ error: string }>()
); 