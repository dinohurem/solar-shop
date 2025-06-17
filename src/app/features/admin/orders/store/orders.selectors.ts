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
