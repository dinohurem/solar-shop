import { createReducer, on } from '@ngrx/store';
import { OrdersState } from './orders.state';
import * as OrdersActions from './orders.actions';

export const initialState: OrdersState = {
    orders: [],
    userOrders: [],
    currentOrder: null,
    loading: false,
    loadingOrder: false,
    loadingUserOrders: false,
    error: null,
    updatingStatus: false,
    confirmingPurchase: false
};

export const ordersReducer = createReducer(
    initialState,

    // Load orders
    on(OrdersActions.loadOrders, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(OrdersActions.loadOrdersSuccess, (state, { orders }) => ({
        ...state,
        orders,
        loading: false,
        error: null
    })),

    on(OrdersActions.loadOrdersFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Load user orders
    on(OrdersActions.loadUserOrders, (state) => ({
        ...state,
        loadingUserOrders: true,
        error: null
    })),

    on(OrdersActions.loadUserOrdersSuccess, (state, { orders }) => ({
        ...state,
        userOrders: orders,
        loadingUserOrders: false,
        error: null
    })),

    on(OrdersActions.loadUserOrdersFailure, (state, { error }) => ({
        ...state,
        loadingUserOrders: false,
        error
    })),

    // Load single order
    on(OrdersActions.loadOrder, (state) => ({
        ...state,
        loadingOrder: true,
        error: null
    })),

    on(OrdersActions.loadOrderSuccess, (state, { order }) => ({
        ...state,
        currentOrder: order,
        loadingOrder: false,
        error: null
    })),

    on(OrdersActions.loadOrderFailure, (state, { error }) => ({
        ...state,
        loadingOrder: false,
        error
    })),

    // Update order status
    on(OrdersActions.updateOrderStatus, (state) => ({
        ...state,
        updatingStatus: true,
        error: null
    })),

    on(OrdersActions.updateOrderStatusSuccess, (state, { orderId, status }) => ({
        ...state,
        orders: state.orders.map(order =>
            order.id === orderId ? { ...order, status: status as any } : order
        ),
        userOrders: state.userOrders.map(order =>
            order.id === orderId ? { ...order, status: status as any } : order
        ),
        currentOrder: state.currentOrder?.id === orderId
            ? { ...state.currentOrder, status: status as any }
            : state.currentOrder,
        updatingStatus: false,
        error: null
    })),

    on(OrdersActions.updateOrderStatusFailure, (state, { error }) => ({
        ...state,
        updatingStatus: false,
        error
    })),

    // Update payment status
    on(OrdersActions.updatePaymentStatus, (state) => ({
        ...state,
        updatingStatus: true,
        error: null
    })),

    on(OrdersActions.updatePaymentStatusSuccess, (state, { orderId, paymentStatus }) => ({
        ...state,
        orders: state.orders.map(order =>
            order.id === orderId ? { ...order, paymentStatus: paymentStatus as any } : order
        ),
        userOrders: state.userOrders.map(order =>
            order.id === orderId ? { ...order, paymentStatus: paymentStatus as any } : order
        ),
        currentOrder: state.currentOrder?.id === orderId
            ? { ...state.currentOrder, paymentStatus: paymentStatus as any }
            : state.currentOrder,
        updatingStatus: false,
        error: null
    })),

    on(OrdersActions.updatePaymentStatusFailure, (state, { error }) => ({
        ...state,
        updatingStatus: false,
        error
    })),

    // Confirm purchase
    on(OrdersActions.confirmPurchase, (state) => ({
        ...state,
        confirmingPurchase: true,
        error: null
    })),

    on(OrdersActions.confirmPurchaseSuccess, (state, { orderId }) => ({
        ...state,
        orders: state.orders.map(order =>
            order.id === orderId ? { ...order, paymentStatus: 'paid' as any } : order
        ),
        userOrders: state.userOrders.map(order =>
            order.id === orderId ? { ...order, paymentStatus: 'paid' as any } : order
        ),
        currentOrder: state.currentOrder?.id === orderId
            ? { ...state.currentOrder, paymentStatus: 'paid' as any }
            : state.currentOrder,
        confirmingPurchase: false,
        error: null
    })),

    on(OrdersActions.confirmPurchaseFailure, (state, { error }) => ({
        ...state,
        confirmingPurchase: false,
        error
    })),

    // Delete order
    on(OrdersActions.deleteOrder, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(OrdersActions.deleteOrderSuccess, (state, { orderId }) => ({
        ...state,
        orders: state.orders.filter(order => order.id !== orderId),
        currentOrder: state.currentOrder?.id === orderId ? null : state.currentOrder,
        loading: false,
        error: null
    })),

    on(OrdersActions.deleteOrderFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Clear current order
    on(OrdersActions.clearCurrentOrder, (state) => ({
        ...state,
        currentOrder: null
    }))
);
