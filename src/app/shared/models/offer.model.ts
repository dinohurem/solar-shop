export interface Offer {
    id: string;
    title: string;
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
    imageUrl: string;
    description?: string;
    shortDescription?: string;
    type?: string;
    status?: string;
    couponCode?: string;
    startDate?: string;
    endDate?: string;
    featured?: boolean;
    isB2B?: boolean; // Flag to separate B2B offers from regular offers
}

export interface OfferFilters {
    featured?: boolean;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
}