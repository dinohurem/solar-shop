import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.state';

export const selectCartState = createFeatureSelector<CartState>('cart');

// Basic selectors
export const selectCart = createSelector(
    selectCartState,
    (state) => state.cart
);

export const selectIsCartOpen = createSelector(
    selectCartState,
    (state) => state.isCartOpen
);

export const selectIsCartLoading = createSelector(
    selectCartState,
    (state) => state.isLoading
);

export const selectCartError = createSelector(
    selectCartState,
    (state) => state.error
);

// Cart items selectors
export const selectCartItems = createSelector(
    selectCart,
    (cart) => cart?.items || []
);

export const selectCartItemCount = createSelector(
    selectCartItems,
    (items) => items.reduce((count, item) => count + item.quantity, 0)
);

export const selectCartUniqueItemCount = createSelector(
    selectCartItems,
    (items) => items.length
);

export const selectIsCartEmpty = createSelector(
    selectCartItems,
    (items) => items.length === 0
);

// Cart totals selectors
export const selectCartSubtotal = createSelector(
    selectCart,
    (cart) => cart?.subtotal || 0
);

export const selectCartTax = createSelector(
    selectCart,
    (cart) => cart?.tax || 0
);

export const selectCartShipping = createSelector(
    selectCart,
    (cart) => cart?.shipping || 0
);

export const selectCartDiscount = createSelector(
    selectCart,
    (cart) => cart?.discount || 0
);

export const selectCartTotal = createSelector(
    selectCart,
    (cart) => cart?.total || 0
);

export const selectCartCurrency = createSelector(
    selectCart,
    (cart) => cart?.currency || 'EUR'
);

// Coupon selectors
export const selectAppliedCoupons = createSelector(
    selectCart,
    (cart) => cart?.appliedCoupons || []
);

export const selectCouponCode = createSelector(
    selectCartState,
    (state) => state.couponCode
);

export const selectIsCouponLoading = createSelector(
    selectCartState,
    (state) => state.isCouponLoading
);

export const selectCouponError = createSelector(
    selectCartState,
    (state) => state.couponError
);

export const selectAvailableCoupons = createSelector(
    selectCartState,
    (state) => state.availableCoupons
);

// Cart step selectors
export const selectCurrentCartStep = createSelector(
    selectCartState,
    (state) => state.currentStep
);

export const selectIsCartStep = createSelector(
    selectCurrentCartStep,
    (step) => step === 'cart'
);

export const selectIsShippingStep = createSelector(
    selectCurrentCartStep,
    (step) => step === 'shipping'
);

export const selectIsPaymentStep = createSelector(
    selectCurrentCartStep,
    (step) => step === 'payment'
);

export const selectIsReviewStep = createSelector(
    selectCurrentCartStep,
    (step) => step === 'review'
);

// Complex selectors
export const selectCartSummary = createSelector(
    selectCartItemCount,
    selectCartUniqueItemCount,
    selectCartSubtotal,
    selectCartTax,
    selectCartShipping,
    selectCartDiscount,
    selectCartTotal,
    selectCartCurrency,
    (itemCount, uniqueItemCount, subtotal, tax, shipping, discount, total, currency) => {
        const calculatedTotal = subtotal + tax + shipping - discount;
        const normalizedTotal = total && total > 0 ? total : calculatedTotal;

        return {
            itemCount,
            uniqueItemCount,
            subtotal,
            tax,
            shipping,
            discount,
            total: Math.max(normalizedTotal, 0),
            currency,
            freeShippingThreshold: 100, // This could come from config
            freeShippingRemaining: Math.max(0, 100 - subtotal)
        };
    }
);

export const selectCartItemById = (itemId: string) => createSelector(
    selectCartItems,
    (items) => items.find(item => item.id === itemId)
);

export const selectCartItemQuantity = (itemId: string) => createSelector(
    selectCartItemById(itemId),
    (item) => item?.quantity || 0
);

export const selectHasCouponsApplied = createSelector(
    selectAppliedCoupons,
    (coupons) => coupons.length > 0
);

export const selectCanApplyCoupon = createSelector(
    selectCouponCode,
    selectIsCouponLoading,
    selectAppliedCoupons,
    (code, isLoading, appliedCoupons) => {
        return code.trim().length > 0 &&
            !isLoading &&
            !appliedCoupons.some(coupon => coupon.code === code.trim());
    }
); 