import { Order } from '../../../../shared/models/order.model';

export interface OrdersState {
    orders: Order[];
    currentOrder: Order | null;
    loading: boolean;
    loadingOrder: boolean;
    error: string | null;
    updatingStatus: boolean;
    confirmingPurchase: boolean;
}
