export interface Offer {
    id: string;
    title: string;
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
    imageUrl: string;
    description?: string;
    shortDescription?: string;
    status?: string;
    code?: string;
    couponCode?: string;
    startDate?: string;
    endDate?: string;
    featured?: boolean;
    isB2B?: boolean; // Flag to separate B2B offers from regular offers
    discount_type?: string;
    discount_value?: number;
}

export interface OfferFilters {
    featured?: boolean;
    status?: string;
    limit?: number;
    offset?: number;
}