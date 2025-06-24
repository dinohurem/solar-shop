import { createAction, props } from '@ngrx/store';
import { Order } from '../../../../shared/models/order.model';

// Load orders actions
export const loadOrders = createAction('[Admin Orders] Load Orders');

export const loadOrdersSuccess = createAction(
    '[Admin Orders] Load Orders Success',
    props<{ orders: Order[] }>()
);

export const loadOrdersFailure = createAction(
    '[Admin Orders] Load Orders Failure',
    props<{ error: string }>()
);

// Load user orders by email actions
export const loadUserOrders = createAction(
    '[User Orders] Load User Orders',
    props<{ userEmail: string }>()
);

export const loadUserOrdersSuccess = createAction(
    '[User Orders] Load User Orders Success',
    props<{ orders: Order[] }>()
);

export const loadUserOrdersFailure = createAction(
    '[User Orders] Load User Orders Failure',
    props<{ error: string }>()
);

// Load single order actions
export const loadOrder = createAction(
    '[Admin Orders] Load Order',
    props<{ orderId: string }>()
);

export const loadOrderSuccess = createAction(
    '[Admin Orders] Load Order Success',
    props<{ order: Order }>()
);

export const loadOrderFailure = createAction(
    '[Admin Orders] Load Order Failure',
    props<{ error: string }>()
);

// Update order status actions
export const updateOrderStatus = createAction(
    '[Admin Orders] Update Order Status',
    props<{ orderId: string; status: string }>()
);

export const updateOrderStatusSuccess = createAction(
    '[Admin Orders] Update Order Status Success',
    props<{ orderId: string; status: string }>()
);

export const updateOrderStatusFailure = createAction(
    '[Admin Orders] Update Order Status Failure',
    props<{ error: string }>()
);

// Update payment status actions
export const updatePaymentStatus = createAction(
    '[Admin Orders] Update Payment Status',
    props<{ orderId: string; paymentStatus: string }>()
);

export const updatePaymentStatusSuccess = createAction(
    '[Admin Orders] Update Payment Status Success',
    props<{ orderId: string; paymentStatus: string }>()
);

export const updatePaymentStatusFailure = createAction(
    '[Admin Orders] Update Payment Status Failure',
    props<{ error: string }>()
);

// Confirm purchase (mark as paid) actions
export const confirmPurchase = createAction(
    '[Admin Orders] Confirm Purchase',
    props<{ orderId: string }>()
);

export const confirmPurchaseSuccess = createAction(
    '[Admin Orders] Confirm Purchase Success',
    props<{ orderId: string }>()
);

export const confirmPurchaseFailure = createAction(
    '[Admin Orders] Confirm Purchase Failure',
    props<{ error: string }>()
);

// Delete order actions
export const deleteOrder = createAction(
    '[Admin Orders] Delete Order',
    props<{ orderId: string }>()
);

export const deleteOrderSuccess = createAction(
    '[Admin Orders] Delete Order Success',
    props<{ orderId: string }>()
);

export const deleteOrderFailure = createAction(
    '[Admin Orders] Delete Order Failure',
    props<{ error: string }>()
);

// Clear current order
export const clearCurrentOrder = createAction('[Admin Orders] Clear Current Order');
