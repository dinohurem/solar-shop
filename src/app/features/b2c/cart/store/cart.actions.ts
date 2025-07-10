import { createAction, props } from '@ngrx/store';
import { Cart, CartItem } from '../../../../shared/models/cart.model';
import { CartStep } from './cart.state';
import { Coupon } from '../../../../shared/models/coupon.model';

// Cart UI Actions
export const openCart = createAction('[Cart] Open Cart');
export const closeCart = createAction('[Cart] Close Cart');
export const toggleCart = createAction('[Cart] Toggle Cart');
export const stopCartLoading = createAction('[Cart] Stop Cart Loading');

// Cart Data Actions
export const loadCart = createAction('[Cart] Load Cart');
export const loadCartSuccess = createAction(
    '[Cart] Load Cart Success',
    props<{ cart: Cart }>()
);
export const loadCartFailure = createAction(
    '[Cart] Load Cart Failure',
    props<{ error: string }>()
);

export const clearCart = createAction('[Cart] Clear Cart');
export const clearCartSuccess = createAction('[Cart] Clear Cart Success');
export const clearCartFailure = createAction(
    '[Cart] Clear Cart Failure',
    props<{ error: string }>()
);

// Order Completion Actions
export const orderCompleted = createAction(
    '[Cart] Order Completed',
    props<{ orderId: string; orderNumber: string }>()
);

// Cart Item Actions
export const addToCart = createAction(
    '[Cart] Add To Cart',
    props<{ productId: string; quantity: number; variantId?: string }>()
);
export const addToCartSuccess = createAction(
    '[Cart] Add To Cart Success',
    props<{ cart: Cart }>()
);
export const addToCartFailure = createAction(
    '[Cart] Add To Cart Failure',
    props<{ error: string }>()
);

export const updateCartItem = createAction(
    '[Cart] Update Cart Item',
    props<{ itemId: string; quantity: number }>()
);
export const updateCartItemSuccess = createAction(
    '[Cart] Update Cart Item Success',
    props<{ cart: Cart }>()
);
export const updateCartItemFailure = createAction(
    '[Cart] Update Cart Item Failure',
    props<{ error: string }>()
);

export const removeFromCart = createAction(
    '[Cart] Remove From Cart',
    props<{ itemId: string }>()
);
export const removeFromCartSuccess = createAction(
    '[Cart] Remove From Cart Success',
    props<{ cart: Cart }>()
);
export const removeFromCartFailure = createAction(
    '[Cart] Remove From Cart Failure',
    props<{ error: string }>()
);

// Quantity Actions
export const increaseQuantity = createAction(
    '[Cart] Increase Quantity',
    props<{ itemId: string }>()
);
export const decreaseQuantity = createAction(
    '[Cart] Decrease Quantity',
    props<{ itemId: string }>()
);

// Coupon Actions
export const setCouponCode = createAction(
    '[Cart] Set Coupon Code',
    props<{ code: string }>()
);

export const applyCoupon = createAction(
    '[Cart] Apply Coupon',
    props<{ code: string }>()
);
export const applyCouponSuccess = createAction(
    '[Cart] Apply Coupon Success',
    props<{ cart: Cart }>()
);
export const applyCouponFailure = createAction(
    '[Cart] Apply Coupon Failure',
    props<{ error: string }>()
);

export const removeCoupon = createAction(
    '[Cart] Remove Coupon',
    props<{ couponId: string }>()
);
export const removeCouponSuccess = createAction(
    '[Cart] Remove Coupon Success',
    props<{ cart: Cart }>()
);
export const removeCouponFailure = createAction(
    '[Cart] Remove Coupon Failure',
    props<{ error: string }>()
);

export const loadAvailableCoupons = createAction('[Cart] Load Available Coupons');
export const loadAvailableCouponsSuccess = createAction(
    '[Cart] Load Available Coupons Success',
    props<{ coupons: Coupon[] }>()
);

export const loadAvailableCouponsFailure = createAction(
    '[Cart] Load Available Coupons Failure',
    props<{ error: string }>()
);

// Checkout Step Actions
export const setCartStep = createAction(
    '[Cart] Set Cart Step',
    props<{ step: CartStep }>()
);
export const nextStep = createAction('[Cart] Next Step');
export const previousStep = createAction('[Cart] Previous Step');

// Offer Actions
export const addToCartFromOffer = createAction(
    '[Cart] Add To Cart From Offer',
    props<{ 
        productId: string; 
        quantity: number; 
        variantId?: string; 
        offerId: string;
        offerName: string;
        offerType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle';
        offerDiscount: number;
        offerOriginalPrice: number;
        offerValidUntil?: string;
    }>()
);

export const addToCartFromOfferSuccess = createAction(
    '[Cart] Add To Cart From Offer Success',
    props<{ cart: Cart }>()
);

export const addToCartFromOfferFailure = createAction(
    '[Cart] Add To Cart From Offer Failure',
    props<{ error: string }>()
);

export const addAllToCartFromOffer = createAction(
    '[Cart] Add All To Cart From Offer',
    props<{ 
        products: Array<{
            productId: string; 
            quantity: number; 
            variantId?: string;
        }>;
        offerId: string;
        offerName: string;
        offerType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle';
        offerDiscount: number;
        offerValidUntil?: string;
    }>()
);

export const addAllToCartFromOfferSuccess = createAction(
    '[Cart] Add All To Cart From Offer Success',
    props<{ cart: Cart; addedCount: number; skippedCount: number }>()
);

export const addAllToCartFromOfferFailure = createAction(
    '[Cart] Add All To Cart From Offer Failure',
    props<{ error: string }>()
);

// Reset Actions
export const resetCartError = createAction('[Cart] Reset Cart Error');
export const resetCouponError = createAction('[Cart] Reset Coupon Error'); 