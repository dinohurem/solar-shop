export interface Order {
    id: string;
    orderNumber: string;
    userId?: string;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    totalAmount: number;
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    discountAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    shippingStatus?: ShippingStatus;
    paymentMethod?: PaymentMethod;
    orderDate: string;
    shippingAddress?: Address;
    billingAddress?: Address;
    trackingNumber?: string;
    notes?: string;
    adminNotes?: string;
    items: OrderItem[];
    is_b2b?: boolean; // Flag to distinguish B2B orders from B2C orders
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId?: string;
    productName: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productImageUrl?: string;
    productSpecifications?: any;
    createdAt: string;
}

export interface Address {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type PaymentStatus =
    | 'pending'
    | 'paid'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';

export type ShippingStatus =
    | 'not_shipped'
    | 'preparing'
    | 'shipped'
    | 'in_transit'
    | 'delivered'
    | 'returned';

export type PaymentMethod =
    | 'credit_card'
    | 'debit_card'
    | 'paypal'
    | 'bank_transfer'
    | 'cash_on_delivery';

export interface OrderFilter {
    status?: OrderStatus[];
    paymentStatus?: PaymentStatus[];
    shippingStatus?: ShippingStatus[];
    dateFrom?: string;
    dateTo?: string;
    customerEmail?: string;
    orderNumber?: string;
    minAmount?: number;
    maxAmount?: number;
}

export interface OrderSummary {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
} 