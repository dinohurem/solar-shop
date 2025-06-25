import { createReducer, on } from '@ngrx/store';
import { B2BCartState, B2BCartItem } from '../models/b2b-cart.model';
import * as B2BCartActions from './b2b-cart.actions';

export const initialB2BCartState: B2BCartState = {
    items: [],
    totalItems: 0,
    subtotal: 0,
    totalSavings: 0,
    loading: false,
    error: null,
    companyId: null,
    companyName: null,
    lastUpdated: null
};

export const b2bCartReducer = createReducer(
    initialB2BCartState,

    // Load cart
    on(B2BCartActions.loadB2BCart, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(B2BCartActions.loadB2BCartSuccess, (state, { items, companyId, companyName }) => ({
        ...state,
        items,
        companyId,
        companyName,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        ...calculateCartTotals(items)
    })),

    on(B2BCartActions.loadB2BCartFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Add to cart
    on(B2BCartActions.addToB2BCart, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(B2BCartActions.addToB2BCartSuccess, (state, { item }) => {
        const existingItemIndex = state.items.findIndex(i => i.productId === item.productId);
        let updatedItems: B2BCartItem[];

        if (existingItemIndex >= 0) {
            // Update existing item quantity
            updatedItems = state.items.map((cartItem, index) =>
                index === existingItemIndex
                    ? {
                        ...cartItem,
                        quantity: cartItem.quantity + item.quantity,
                        totalPrice: (cartItem.quantity + item.quantity) * cartItem.unitPrice,
                        addedAt: new Date()
                    }
                    : cartItem
            );
        } else {
            // Add new item
            updatedItems = [...state.items, item];
        }

        return {
            ...state,
            items: updatedItems,
            loading: false,
            error: null,
            lastUpdated: new Date(),
            ...calculateCartTotals(updatedItems)
        };
    }),

    on(B2BCartActions.addToB2BCartFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update cart item
    on(B2BCartActions.updateB2BCartItem, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(B2BCartActions.updateB2BCartItemSuccess, (state, { productId, quantity }) => {
        const updatedItems = quantity === 0
            ? state.items.filter(item => item.productId !== productId)
            : state.items.map(item =>
                item.productId === productId
                    ? {
                        ...item,
                        quantity,
                        totalPrice: quantity * item.unitPrice,
                        addedAt: new Date()
                    }
                    : item
            );

        return {
            ...state,
            items: updatedItems,
            loading: false,
            error: null,
            lastUpdated: new Date(),
            ...calculateCartTotals(updatedItems)
        };
    }),

    on(B2BCartActions.updateB2BCartItemFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Remove from cart
    on(B2BCartActions.removeFromB2BCart, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(B2BCartActions.removeFromB2BCartSuccess, (state, { productId }) => {
        const updatedItems = state.items.filter(item => item.productId !== productId);

        return {
            ...state,
            items: updatedItems,
            loading: false,
            error: null,
            lastUpdated: new Date(),
            ...calculateCartTotals(updatedItems)
        };
    }),

    on(B2BCartActions.removeFromB2BCartFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Clear cart
    on(B2BCartActions.clearB2BCart, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(B2BCartActions.clearB2BCartSuccess, (state) => ({
        ...state,
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalSavings: 0,
        loading: false,
        error: null,
        lastUpdated: new Date()
    })),

    on(B2BCartActions.clearB2BCartFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Sync cart
    on(B2BCartActions.syncB2BCart, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(B2BCartActions.syncB2BCartSuccess, (state, { items }) => ({
        ...state,
        items,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        ...calculateCartTotals(items)
    })),

    on(B2BCartActions.syncB2BCartFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Order completion
    on(B2BCartActions.b2bOrderCompleted, (state) => ({
        ...state,
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalSavings: 0,
        lastUpdated: new Date()
    })),

    // Error handling
    on(B2BCartActions.clearB2BCartError, (state) => ({
        ...state,
        error: null
    }))
);

// Helper function to calculate cart totals
function calculateCartTotals(items: B2BCartItem[]) {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalSavings = items.reduce((sum, item) =>
        sum + ((item.retailPrice - item.unitPrice) * item.quantity), 0
    );

    return {
        totalItems,
        subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
        totalSavings: Math.round(totalSavings * 100) / 100
    };
} 