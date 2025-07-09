import { createAction, props } from '@ngrx/store';

export interface CompanyPricing {
    id: string;
    company_id: string;
    product_id: string;
    price_tier_1: number;
    quantity_tier_1: number;
    price_tier_2?: number;
    quantity_tier_2?: number;
    price_tier_3?: number;
    quantity_tier_3?: number;
    minimum_order: number;
    created_at: string;
    updated_at: string;
}

export interface Company {
    id: string;
    name: string;
    email: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
}

// Load companies for dropdown
export const loadCompanies = createAction('[Admin Company Pricing] Load Companies');

export const loadCompaniesSuccess = createAction(
    '[Admin Company Pricing] Load Companies Success',
    props<{ companies: Company[] }>()
);

export const loadCompaniesFailure = createAction(
    '[Admin Company Pricing] Load Companies Failure',
    props<{ error: string }>()
);

// Load products for dropdown
export const loadProducts = createAction('[Admin Company Pricing] Load Products');

export const loadProductsSuccess = createAction(
    '[Admin Company Pricing] Load Products Success',
    props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
    '[Admin Company Pricing] Load Products Failure',
    props<{ error: string }>()
);

// Load company pricing
export const loadCompanyPricing = createAction('[Admin Company Pricing] Load Company Pricing');

export const loadCompanyPricingSuccess = createAction(
    '[Admin Company Pricing] Load Company Pricing Success',
    props<{ companyPricing: CompanyPricing[] }>()
);

export const loadCompanyPricingFailure = createAction(
    '[Admin Company Pricing] Load Company Pricing Failure',
    props<{ error: string }>()
);

// Create company pricing
export const createCompanyPricing = createAction(
    '[Admin Company Pricing] Create Company Pricing',
    props<{ pricing: Omit<CompanyPricing, 'id' | 'created_at' | 'updated_at'> }>()
);

export const createCompanyPricingSuccess = createAction(
    '[Admin Company Pricing] Create Company Pricing Success',
    props<{ pricing: CompanyPricing }>()
);

export const createCompanyPricingFailure = createAction(
    '[Admin Company Pricing] Create Company Pricing Failure',
    props<{ error: string }>()
);

// Update company pricing
export const updateCompanyPricing = createAction(
    '[Admin Company Pricing] Update Company Pricing',
    props<{ id: string; pricing: Partial<CompanyPricing> }>()
);

export const updateCompanyPricingSuccess = createAction(
    '[Admin Company Pricing] Update Company Pricing Success',
    props<{ pricing: CompanyPricing }>()
);

export const updateCompanyPricingFailure = createAction(
    '[Admin Company Pricing] Update Company Pricing Failure',
    props<{ error: string }>()
);

// Delete company pricing
export const deleteCompanyPricing = createAction(
    '[Admin Company Pricing] Delete Company Pricing',
    props<{ id: string }>()
);

export const deleteCompanyPricingSuccess = createAction(
    '[Admin Company Pricing] Delete Company Pricing Success',
    props<{ id: string }>()
);

export const deleteCompanyPricingFailure = createAction(
    '[Admin Company Pricing] Delete Company Pricing Failure',
    props<{ error: string }>()
);

// Select company pricing
export const selectCompanyPricing = createAction(
    '[Admin Company Pricing] Select Company Pricing',
    props<{ pricing: CompanyPricing | null }>()
);

// Clear company pricing state
export const clearCompanyPricingState = createAction('[Admin Company Pricing] Clear State'); 