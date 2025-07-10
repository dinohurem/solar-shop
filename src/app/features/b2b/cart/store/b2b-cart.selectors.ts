import { createFeatureSelector, createSelector } from '@ngrx/store';
import { B2BCartState, B2BCartSummary } from '../models/b2b-cart.model';

export const selectB2BCartState = createFeatureSelector<B2BCartState>('b2bCart');

// Basic selectors
export const selectB2BCartItems = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.items
);

export const selectB2BCartLoading = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.loading
);

export const selectB2BCartError = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.error
);

export const selectB2BCartTotalItems = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.totalItems
);

export const selectB2BCartSubtotal = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.subtotal
);

export const selectB2BCartTotalSavings = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.totalSavings
);

export const selectB2BCartCompanyInfo = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => ({
        companyId: state.companyId,
        companyName: state.companyName
    })
);

export const selectB2BCartLastUpdated = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.lastUpdated
);

// Computed selectors
export const selectB2BCartIsEmpty = createSelector(
    selectB2BCartItems,
    (items) => items.length === 0
);

export const selectB2BCartItemsCount = createSelector(
    selectB2BCartItems,
    (items) => items.length
);

export const selectB2BCartItemById = (productId: string) => createSelector(
    selectB2BCartItems,
    (items) => items.find(item => item.productId === productId)
);

export const selectB2BCartItemQuantity = (productId: string) => createSelector(
    selectB2BCartItems,
    (items) => {
        const item = items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    }
);

export const selectB2BCartSummary = createSelector(
    selectB2BCartState,
    (state: B2BCartState): B2BCartSummary => {
        // B2B prices are without tax - no tax calculation needed
        const estimatedTax = 0;
        // B2B uses pickup at store - no shipping costs
        const estimatedShipping = 0;
        const total = Math.max(0, state.subtotal - state.couponDiscount);

        return {
            itemCount: state.totalItems,
            subtotal: state.subtotal,
            totalSavings: state.totalSavings,
            couponDiscount: state.couponDiscount,
            estimatedTax,
            estimatedShipping,
            total: Math.round(total * 100) / 100
        };
    }
);

// Category breakdown
export const selectB2BCartItemsByCategory = createSelector(
    selectB2BCartItems,
    (items) => {
        const categories = items.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, typeof items>);

        return categories;
    }
);

// Savings breakdown
export const selectB2BCartSavingsBreakdown = createSelector(
    selectB2BCartItems,
    (items) => {
        return items.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitSavings: item.retailPrice - item.unitPrice,
            totalSavings: (item.retailPrice - item.unitPrice) * item.quantity,
            savingsPercentage: Math.round(((item.retailPrice - item.unitPrice) / item.retailPrice) * 100)
        }));
    }
);

// Check if product is in cart
export const selectIsProductInB2BCart = (productId: string) => createSelector(
    selectB2BCartItems,
    (items) => items.some(item => item.productId === productId)
);

// Get product pricing info for cart context
export const selectB2BCartProductPricing = (productId: string) => createSelector(
    selectB2BCartItems,
    (items) => {
        const item = items.find(item => item.productId === productId);
        if (!item) return null;

        return {
            unitPrice: item.unitPrice,
            retailPrice: item.retailPrice,
            companyPrice: item.companyPrice,
            partnerPrice: item.partnerPrice,
            savings: item.savings,
            hasCompanyPrice: !!item.companyPrice,
            hasPartnerPrice: !!item.partnerPrice
        };
    }
);

// Sidebar visibility selector
export const selectB2BCartSidebarOpen = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.sidebarOpen
);

// Coupon selectors
export const selectB2BCartAppliedCoupons = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.appliedCoupons
);

export const selectB2BCartCouponDiscount = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.couponDiscount
);

export const selectB2BCartCouponError = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.couponError
);

export const selectB2BCartIsCouponLoading = createSelector(
    selectB2BCartState,
    (state: B2BCartState) => state.isCouponLoading
);

export const selectB2BCartHasCoupons = createSelector(
    selectB2BCartAppliedCoupons,
    (coupons) => coupons.length > 0
);

export const selectB2BCartCouponById = (couponId: string) => createSelector(
    selectB2BCartAppliedCoupons,
    (coupons) => coupons.find(coupon => coupon.id === couponId)
);

// Company verification selectors
export const selectB2BCartCompanyId = createSelector(
    selectB2BCartCompanyInfo,
    (companyInfo) => companyInfo.companyId
);

export const selectB2BCartHasCompanyId = createSelector(
    selectB2BCartCompanyInfo,
    (companyInfo) => !!companyInfo.companyId
); 