import { Order } from '../../../../shared/models/order.model';
import { Review } from '../../../../shared/models/review.model';

export interface OrdersState {
    orders: Order[];
    userOrders: Order[];
    userReviews: Review[];
    currentOrder: Order | null;
    loading: boolean;
    loadingOrder: boolean;
    loadingUserOrders: boolean;
    loadingUserReviews: boolean;
    error: string | null;
    updatingStatus: boolean;
    confirmingPurchase: boolean;
}
