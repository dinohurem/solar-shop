import { createAction, props } from '@ngrx/store';

export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    is_primary: boolean;
    order: number;
    type: 'main' | 'gallery' | 'thumbnail' | 'technical';
}

export interface Product {
    id: string;
    name: string;
    description: string;
    short_description: string;
    images: ProductImage[];
    category_id: string;
    category?: string; // populated from join
    sku: string;
    price: number; // retail price
    minimum_order?: number;
    stock_quantity?: number;
    stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
    is_active: boolean;
    brand: string;
    specifications?: Record<string, string>;
    features?: string[];
    created_at: string;
    updated_at: string;
}

export interface CompanyPricing {
    id: string;
    company_id: string;
    product_id: string;
    price: number; // Backward compatibility - will map to price_tier_1
    minimum_order: number;
    // Quantity-based pricing tiers
    quantity_tier_1: number;
    price_tier_1: number;
    quantity_tier_2?: number;
    price_tier_2?: number;
    quantity_tier_3?: number;
    price_tier_3?: number;
    created_at: string;
    updated_at: string;
}

export interface ProductWithPricing extends Product {
    company_price?: number; // Lowest company price based on quantity tiers
    partner_price?: number;
    savings?: number;
    in_stock: boolean;
    partner_only: boolean;
    has_pending_price?: boolean;
    image_url?: string; // computed from images array for easier template access
    company_minimum_order?: number; // company-specific minimum order from company_pricing table
    categories?: Array<{ name: string; isPrimary: boolean }>; // multiple categories with primary designation
    // Company pricing tiers
    company_pricing_tiers?: {
        quantity: number;
        price: number;
    }[];
}

// Load products
export const loadProducts = createAction(
    '[B2B Products] Load Products'
);

export const loadProductsSuccess = createAction(
    '[B2B Products] Load Products Success',
    props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
    '[B2B Products] Load Products Failure',
    props<{ error: string }>()
);

// Load company pricing
export const loadCompanyPricing = createAction(
    '[B2B Products] Load Company Pricing',
    props<{ companyId: string }>()
);

export const loadCompanyPricingSuccess = createAction(
    '[B2B Products] Load Company Pricing Success',
    props<{ pricing: CompanyPricing[] }>()
);

export const loadCompanyPricingFailure = createAction(
    '[B2B Products] Load Company Pricing Failure',
    props<{ error: string }>()
);

// Load product by ID
export const loadProduct = createAction(
    '[B2B Products] Load Product',
    props<{ productId: string }>()
);

export const loadProductSuccess = createAction(
    '[B2B Products] Load Product Success',
    props<{ product: Product }>()
);

export const loadProductFailure = createAction(
    '[B2B Products] Load Product Failure',
    props<{ error: string }>()
);

// Clear error
export const clearProductsError = createAction(
    '[B2B Products] Clear Error'
);

// Load categories
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    is_active: boolean;
    sort_order: number;
}

export const loadCategories = createAction(
    '[B2B Products] Load Categories'
);

export const loadCategoriesSuccess = createAction(
    '[B2B Products] Load Categories Success',
    props<{ categories: Category[] }>()
);

export const loadCategoriesFailure = createAction(
    '[B2B Products] Load Categories Failure',
    props<{ error: string }>()
); 