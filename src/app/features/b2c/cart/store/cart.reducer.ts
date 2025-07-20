import { createReducer, on } from '@ngrx/store';
import { CartState, initialCartState } from './cart.state';
import * as CartActions from './cart.actions';

export const cartReducer = createReducer(
    initialCartState,

    // Cart UI Actions
    on(CartActions.openCart, (state) => ({
        ...state,
        isCartOpen: true
    })),

    on(CartActions.closeCart, (state) => ({
        ...state,
        isCartOpen: false
    })),

    on(CartActions.toggleCart, (state) => ({
        ...state,
        isCartOpen: !state.isCartOpen
    })),

    on(CartActions.stopCartLoading, (state) => ({
        ...state,
        isLoading: false
    })),

    // Load Cart Actions
    on(CartActions.loadCart, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(CartActions.loadCartSuccess, (state, { cart }) => ({
        ...state,
        cart,
        isLoading: false,
        error: null
    })),

    on(CartActions.loadCartFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),

    // Clear Cart Actions
    on(CartActions.clearCart, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(CartActions.clearCartSuccess, (state) => ({
        ...state,
        cart: null,
        isLoading: false,
        error: null
    })),

    on(CartActions.clearCartFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),

    // Add to Cart Actions
    on(CartActions.addToCart, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(CartActions.addToCartSuccess, (state, { cart }) => {
        const newState = {
            ...state,
            cart,
            isLoading: false,
            error: null,
            isCartOpen: true
        };
        return newState;
    }),

    on(CartActions.addToCartFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),

    // Update Cart Item Actions
    on(CartActions.updateCartItem, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(CartActions.updateCartItemSuccess, (state, { cart }) => ({
        ...state,
        cart,
        isLoading: false,
        error: null
    })),

    on(CartActions.updateCartItemFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),

    // Remove from Cart Actions
    on(CartActions.removeFromCart, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(CartActions.removeFromCartSuccess, (state, { cart }) => ({
        ...state,
        cart,
        isLoading: false,
        error: null
    })),

    on(CartActions.removeFromCartFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),

    // Coupon Actions
    on(CartActions.setCouponCode, (state, { code }) => ({
        ...state,
        couponCode: code,
        couponError: null
    })),

    on(CartActions.applyCoupon, (state) => ({
        ...state,
        isCouponLoading: true,
        couponError: null
    })),

    on(CartActions.applyCouponSuccess, (state, { cart }) => ({
        ...state,
        cart,
        isCouponLoading: false,
        couponError: null,
        couponCode: '' // Clear the input after successful application
    })),

    on(CartActions.applyCouponFailure, (state, { error }) => ({
        ...state,
        isCouponLoading: false,
        couponError: error
    })),

    on(CartActions.removeCoupon, (state) => ({
        ...state,
        isCouponLoading: true,
        couponError: null
    })),

    on(CartActions.removeCouponSuccess, (state, { cart }) => ({
        ...state,
        cart,
        isCouponLoading: false,
        couponError: null
    })),

    on(CartActions.removeCouponFailure, (state, { error }) => ({
        ...state,
        isCouponLoading: false,
        couponError: error
    })),

    // Available Coupons Actions
    on(CartActions.loadAvailableCoupons, (state) => ({
        ...state,
        isCouponLoading: true
    })),

    on(CartActions.loadAvailableCouponsSuccess, (state, { coupons }) => ({
        ...state,
        availableCoupons: coupons,
        isCouponLoading: false
    })),

    on(CartActions.loadAvailableCouponsFailure, (state, { error }) => ({
        ...state,
        isCouponLoading: false,
        couponError: error
    })),

    // Cart Step Actions
    on(CartActions.setCartStep, (state, { step }) => ({
        ...state,
        currentStep: step
    })),

    on(CartActions.nextStep, (state) => {
        const steps: Array<typeof state.currentStep> = ['cart', 'shipping', 'payment', 'review'];
        const currentIndex = steps.indexOf(state.currentStep);
        const nextIndex = Math.min(currentIndex + 1, steps.length - 1);

        return {
            ...state,
            currentStep: steps[nextIndex]
        };
    }),

    on(CartActions.previousStep, (state) => {
        const steps: Array<typeof state.currentStep> = ['cart', 'shipping', 'payment', 'review'];
        const currentIndex = steps.indexOf(state.currentStep);
        const previousIndex = Math.max(currentIndex - 1, 0);

        return {
            ...state,
            currentStep: steps[previousIndex]
        };
    }),

    // Reset Actions
    on(CartActions.resetCartError, (state) => ({
        ...state,
        error: null
    })),

    on(CartActions.resetCouponError, (state) => ({
        ...state,
        couponError: null
    })),

    // Add All to Cart from Offer Actions
    on(CartActions.addAllToCartFromOffer, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),

    on(CartActions.addAllToCartFromOfferSuccess, (state, { cart }) => ({
        ...state,
        cart,
        isLoading: false,
        error: null
    })),

    on(CartActions.addAllToCartFromOfferFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    }))
); 