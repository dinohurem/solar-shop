export interface Cart {
    id: string;
    userId?: string;
    sessionId?: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
    appliedCoupons: AppliedCoupon[];
    shippingAddress?: ShippingAddress;
    billingAddress?: BillingAddress;
    paymentMethod?: PaymentMethod;
    shippingMethod?: ShippingMethod;
    notes?: string;
    status: CartStatus;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
    metadata?: CartMetadata;
}

export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    description?: string;
    sku: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    weight?: number;
    dimensions?: string;
    image: string;
    category: string;
    brand: string;
    customizations?: ProductCustomization[];
    addedAt: string;
    updatedAt: string;
    availability: ItemAvailability;
    shippingInfo: ItemShippingInfo;
    taxInfo: ItemTaxInfo;
    // Offer pricing fields
    offerId?: string;
    offerName?: string;
    offerType?: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle';
    offerDiscount?: number;
    offerOriginalPrice?: number;
    offerValidUntil?: string;
    offerAppliedAt?: string;
    offerSavings?: number;
}

export interface ProductCustomization {
    type: string;
    name: string;
    value: string;
    price: number;
    required: boolean;
}

export interface ItemAvailability {
    quantity: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
    estimatedDelivery?: string;
}

export interface ItemShippingInfo {
    weight: number;
    dimensions: string;
    shippingClass: string;
    freeShipping: boolean;
    restrictions?: string[];
}

export interface ItemTaxInfo {
    taxable: boolean;
    taxClass: string;
    taxRate: number;
    taxAmount: number;
}

export interface AppliedCoupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';
    value: number;
    discountAmount: number;
    appliedAt: string;
    expiresAt?: string;
    restrictions?: CouponRestrictions;
}

export interface CouponRestrictions {
    minOrderAmount?: number;
    maxOrderAmount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    excludedProducts?: string[];
    excludedCategories?: string[];
    maxUsagePerUser?: number;
    firstTimeCustomerOnly?: boolean;
}

export interface ShippingAddress {
    id?: string;
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
    instructions?: string;
    isDefault?: boolean;
}

export interface BillingAddress {
    id?: string;
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
    sameAsShipping: boolean;
    isDefault?: boolean;
}

export interface PaymentMethod {
    id?: string;
    type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'digital_wallet' | 'cash_on_delivery';
    provider?: string;
    token?: string;
    lastFourDigits?: string;
    expiryMonth?: number;
    expiryYear?: number;
    holderName?: string;
    isDefault?: boolean;
    isStored?: boolean;
}

export interface ShippingMethod {
    id: string;
    name: string;
    description?: string;
    cost: number;
    estimatedDays: number;
    carrier: string;
    trackingAvailable: boolean;
    insuranceIncluded: boolean;
    signatureRequired: boolean;
    restrictions?: string[];
}

export type CartStatus =
    | 'active'
    | 'abandoned'
    | 'converted'
    | 'expired'
    | 'saved_for_later'
    | 'checkout_in_progress';

export interface CartMetadata {
    source: string;
    referrer?: string;
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    ipAddress?: string;
    userAgent?: string;
    abandonedEmailSent?: boolean;
    recoveryEmailsSent: number;
    lastReminderSent?: string;
}

export interface CartSummary {
    itemCount: number;
    uniqueItemCount: number;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
    estimatedDelivery?: string;
    freeShippingThreshold?: number;
    freeShippingRemaining?: number;
}

export interface CartValidation {
    isValid: boolean;
    errors: CartValidationError[];
    warnings: CartValidationWarning[];
}

export interface CartValidationError {
    type: 'out_of_stock' | 'price_changed' | 'product_unavailable' | 'quantity_exceeded' | 'shipping_unavailable';
    itemId?: string;
    message: string;
    details?: any;
}

export interface CartValidationWarning {
    type: 'low_stock' | 'price_increase' | 'shipping_delay' | 'limited_time_offer';
    itemId?: string;
    message: string;
    details?: any;
}

export interface SavedCart {
    id: string;
    userId: string;
    name: string;
    description?: string;
    items: CartItem[];
    total: number;
    currency: string;
    isPublic: boolean;
    shareToken?: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
}

export interface CartRecommendation {
    type: 'frequently_bought_together' | 'customers_also_bought' | 'similar_products' | 'upsell' | 'cross_sell';
    products: RecommendedProduct[];
    title: string;
    description?: string;
}

export interface RecommendedProduct {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    discount?: number;
    reason?: string;
}

export interface CartAnalytics {
    cartId: string;
    events: CartEvent[];
    metrics: CartMetrics;
}

export interface CartEvent {
    type: 'item_added' | 'item_removed' | 'item_updated' | 'coupon_applied' | 'coupon_removed' | 'checkout_started' | 'checkout_completed' | 'cart_abandoned';
    timestamp: string;
    itemId?: string;
    details?: any;
}

export interface CartMetrics {
    timeToCheckout?: number;
    itemsAddedCount: number;
    itemsRemovedCount: number;
    couponsAppliedCount: number;
    checkoutAttempts: number;
    abandonmentStage?: 'cart' | 'shipping' | 'payment' | 'review';
    conversionRate?: number;
}

export interface CartFilter {
    status?: CartStatus[];
    dateRange?: {
        start: string;
        end: string;
    };
    totalRange?: {
        min: number;
        max: number;
    };
    itemCount?: {
        min: number;
        max: number;
    };
    hasUser?: boolean;
    hasShippingAddress?: boolean;
    hasPaymentMethod?: boolean;
    sortBy?: 'createdAt' | 'updatedAt' | 'total' | 'itemCount';
    sortOrder?: 'asc' | 'desc';
}

export interface CartSearchResult {
    carts: Cart[];
    total: number;
    page: number;
    limit: number;
    filters: CartFilter;
    facets: CartFacets;
}

export interface CartFacets {
    status: FacetItem[];
    totalRanges: FacetItem[];
    itemCountRanges: FacetItem[];
    currencies: FacetItem[];
    deviceTypes: FacetItem[];
}

export interface FacetItem {
    value: string;
    label: string;
    count: number;
    selected: boolean;
} 