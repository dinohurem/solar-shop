export interface B2BCartItem {
    id: string;
    productId: string;
    name: string;
    sku: string;
    imageUrl: string;
    quantity: number;
    unitPrice: number; // This will be the B2B price (company or partner price)
    retailPrice: number; // Original retail price for comparison
    totalPrice: number;
    minimumOrder: number;
    companyPrice?: number; // Company-specific price
    partnerPrice?: number; // Standard partner price
    savings: number; // Amount saved vs retail price
    category: string;
    inStock: boolean;
    addedAt: Date;
}

export interface B2BCartState {
    items: B2BCartItem[];
    totalItems: number;
    subtotal: number;
    totalSavings: number; // Total savings vs retail prices
    loading: boolean;
    error: string | null;
    companyId: string | null; // The company this cart belongs to
    companyName: string | null;
    lastUpdated: Date | null;
    sidebarOpen: boolean; // Sidebar visibility state
}

export interface B2BCartSummary {
    itemCount: number;
    subtotal: number;
    totalSavings: number;
    estimatedTax: number;
    estimatedShipping: number;
    total: number;
}

export interface AddToB2BCartPayload {
    productId: string;
    quantity: number;
    companyId: string;
}

export interface UpdateB2BCartItemPayload {
    productId: string;
    quantity: number;
}

export interface RemoveFromB2BCartPayload {
    productId: string;
}

// B2B specific shipping information
export interface B2BShippingInfo {
    // Company information (pre-filled and disabled)
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    contactPersonName: string;
    contactPersonEmail: string;

    // Delivery details
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostalCode: string;
    deliveryCountry: string;
    deliveryContact?: string; // Optional different contact for delivery
    deliveryPhone?: string;

    // Special instructions
    deliveryInstructions?: string;
    purchaseOrderNumber?: string; // For company accounting
    requestedDeliveryDate?: Date;

    // Shipping method
    shippingMethod: 'standard' | 'express' | 'scheduled';
} 