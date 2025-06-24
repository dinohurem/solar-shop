import { Order } from '../../../../shared/models/order.model';

export interface OrdersState {
    orders: Order[];
    userOrders: Order[];
    currentOrder: Order | null;
    loading: boolean;
    loadingOrder: boolean;
    loadingUserOrders: boolean;
    error: string | null;
    updatingStatus: boolean;
    confirmingPurchase: boolean;
}
