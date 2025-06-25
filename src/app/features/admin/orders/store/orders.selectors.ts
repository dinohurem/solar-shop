import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrdersState } from './orders.state';

export const selectOrdersState = createFeatureSelector<OrdersState>('adminOrders');

export const selectOrders = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.orders
);

export const selectCurrentOrder = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.currentOrder
);

export const selectOrdersLoading = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.loading
);

export const selectOrderLoading = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.loadingOrder
);

export const selectOrdersError = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.error
);

export const selectUpdatingStatus = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.updatingStatus
);

export const selectConfirmingPurchase = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.confirmingPurchase
);

export const selectOrderById = (orderId: string) => createSelector(
    selectOrders,
    (orders) => orders.find(order => order.id === orderId)
);

export const selectUserOrders = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.userOrders
);

export const selectUserOrdersLoading = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.loadingUserOrders
);

export const selectUserReviews = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.userReviews
);

export const selectUserReviewsLoading = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.loadingUserReviews
);

// B2C Order creation selectors
export const selectB2COrderCreating = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.loading
);

export const selectB2COrderCreated = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.currentOrder
);

export const selectB2COrderError = createSelector(
    selectOrdersState,
    (state: OrdersState) => state.error
);
