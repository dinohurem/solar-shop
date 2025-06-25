import { createReducer, on } from '@ngrx/store';
import { OrdersState } from './orders.state';
import * as OrdersActions from './orders.actions';

export const initialState: OrdersState = {
    orders: [],
    userOrders: [],
    userReviews: [],
    currentOrder: null,
    loading: false,
    loadingOrder: false,
    loadingUserOrders: false,
    loadingUserReviews: false,
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

    // Load user reviews
    on(OrdersActions.loadUserReviews, (state) => ({
        ...state,
        loadingUserReviews: true,
        error: null
    })),

    on(OrdersActions.loadUserReviewsSuccess, (state, { reviews }) => ({
        ...state,
        userReviews: reviews,
        loadingUserReviews: false,
        error: null
    })),

    on(OrdersActions.loadUserReviewsFailure, (state, { error }) => ({
        ...state,
        loadingUserReviews: false,
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
    })),

    // B2C Order creation
    on(OrdersActions.createB2COrder, (state) => {
        console.log('Reducer: createB2COrder - setting loading to true');
        return {
            ...state,
            loading: true,
            error: null
        };
    }),

    on(OrdersActions.createB2COrderSuccess, (state, { order, orderNumber }) => {
        console.log('Reducer: createB2COrderSuccess - order created:', order);
        return {
            ...state,
            currentOrder: order,
            loading: false,
            error: null
        };
    }),

    on(OrdersActions.createB2COrderFailure, (state, { error }) => {
        console.log('Reducer: createB2COrderFailure - error:', error);
        return {
            ...state,
            loading: false,
            error
        };
    }),

    // Clear B2C order state
    on(OrdersActions.clearB2COrderState, (state) => ({
        ...state,
        currentOrder: null,
        loading: false,
        error: null
    }))
);
