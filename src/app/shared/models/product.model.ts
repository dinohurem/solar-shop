export interface Product {
    id: string;
    name: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    currency: string;
    sku: string;
    brand: string;
    model?: string;
    category: ProductCategory;
    images: ProductImage[];
    specifications: { [key: string]: string };
    features: string[];
    availability: ProductAvailability;
    rating: ProductRating;
    tags: string[];
    weight?: number;
    dimensions?: string;
    warranty: ProductWarranty;
    energyEfficiency?: EnergyEfficiency;
    certifications: string[];
    technical_sheet?: string;
    installationRequired: boolean;
    shippingInfo: ShippingInfo;
    relatedProducts?: string[];
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isFeatured: boolean;
    isOnSale: boolean;
    seoMetadata?: SeoMetadata;
}

export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
    description?: string;
    image?: string;
    isActive: boolean;
}

export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
    type: 'main' | 'gallery' | 'thumbnail' | 'technical';
}

export interface ProductAvailability {
    quantity: number;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
    estimatedDelivery?: string;
}

export interface ProductRating {
    average: number;
    count: number;
    distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
}

export interface ProductWarranty {
    duration: number;
    unit: 'months' | 'years';
    type: 'manufacturer' | 'extended' | 'limited';
    description: string;
    coverage: string[];
}

export interface EnergyEfficiency {
    rating: string;
    efficiency: number;
    powerOutput: number;
    powerUnit: 'W' | 'kW' | 'MW';
    annualProduction?: number;
    productionUnit?: 'kWh' | 'MWh';
}

export interface ShippingInfo {
    freeShipping: boolean;
    shippingCost?: number;
    estimatedDays: number;
    shippingMethods: string[];
    restrictions?: string[];
}

export interface SeoMetadata {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl?: string;
}

export interface ProductFilter {
    categories?: string[];
    brands?: string[];
    priceRange?: {
        min: number;
        max: number;
    };
    rating?: number;
    availability?: string[];
    features?: string[];
    sortBy?: 'name' | 'price' | 'rating' | 'newest' | 'popularity';
    sortOrder?: 'asc' | 'desc';
}

export interface ProductSearchResult {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    filters: ProductFilter;
    facets: ProductFacets;
}

export interface ProductFacets {
    categories: FacetItem[];
    brands: FacetItem[];
    priceRanges: FacetItem[];
    ratings: FacetItem[];
    features: FacetItem[];
}

export interface FacetItem {
    value: string;
    label: string;
    count: number;
    selected: boolean;
} 