import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ProductsState } from './products.reducer';
import { ProductWithPricing } from './products.actions';

export const selectProductsFeature = createFeatureSelector<ProductsState>('b2bProducts');

export const selectProducts = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.products
);

export const selectCompanyPricing = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.companyPricing
);

export const selectSelectedProduct = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.selectedProduct
);

export const selectProductsLoading = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.loading
);

export const selectProductsError = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.error
);

export const selectCategories = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.categories
);

export const selectCategoriesLoading = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.categoriesLoading
);

// Combined selector for products with pricing
export const selectProductsWithPricing = createSelector(
    selectProducts,
    selectCompanyPricing,
    (products, companyPricing): ProductWithPricing[] => {
        return products.map(product => {
            const customPricing = companyPricing.find(p => p.product_id === product.id);
            const company_price = customPricing ? customPricing.price : undefined;

            // Calculate savings if there's a company price
            const savings = company_price ? product.price - company_price : undefined;

            return {
                ...product,
                company_price,
                partner_price: undefined, // TODO: Add partner pricing logic
                savings,
                in_stock: (product.stock_quantity || 0) > 0,
                partner_only: false, // TODO: Add partner only logic
                has_pending_price: !company_price
            };
        });
    }
);

// Get product by ID with pricing
export const selectProductById = (productId: string) => createSelector(
    selectProductsWithPricing,
    (products: ProductWithPricing[]) => products.find(p => p.id === productId)
); 