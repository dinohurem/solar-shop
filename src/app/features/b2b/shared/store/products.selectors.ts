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
            
            // Build pricing tiers array
            let company_pricing_tiers: { quantity: number; price: number; }[] = [];
            let company_price: number | undefined;
            
            if (customPricing) {
                // Always add tier 1
                company_pricing_tiers.push({
                    quantity: customPricing.quantity_tier_1 || 1,
                    price: customPricing.price_tier_1 || customPricing.price
                });
                
                // Add tier 2 if exists
                if (customPricing.quantity_tier_2 && customPricing.price_tier_2) {
                    company_pricing_tiers.push({
                        quantity: customPricing.quantity_tier_2,
                        price: customPricing.price_tier_2
                    });
                }
                
                // Add tier 3 if exists
                if (customPricing.quantity_tier_3 && customPricing.price_tier_3) {
                    company_pricing_tiers.push({
                        quantity: customPricing.quantity_tier_3,
                        price: customPricing.price_tier_3
                    });
                }
                
                // Company price is the lowest price (usually the highest quantity tier)
                company_price = Math.min(...company_pricing_tiers.map(t => t.price));
            }
            
            const company_minimum_order = customPricing ? customPricing.minimum_order : undefined;

            // Calculate savings based on the lowest company price
            const savings = company_price ? product.price - company_price : undefined;

            return {
                ...product,
                company_price,
                partner_price: undefined, // TODO: Add partner pricing logic
                savings,
                in_stock: (product.stock_quantity || 0) > 0,
                partner_only: false, // TODO: Add partner only logic
                has_pending_price: !company_price,
                company_minimum_order,
                company_pricing_tiers: company_pricing_tiers.length > 0 ? company_pricing_tiers : undefined
            };
        });
    }
);

// Filter selectors
export const selectFilters = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.filters
);

export const selectSearchQuery = createSelector(
    selectFilters,
    (filters) => filters.searchQuery
);

export const selectCategoryFilters = createSelector(
    selectFilters,
    (filters) => filters.categories
);

export const selectManufacturerFilters = createSelector(
    selectFilters,
    (filters) => filters.manufacturers
);

export const selectAvailabilityFilter = createSelector(
    selectFilters,
    (filters) => filters.availability
);

export const selectSortBy = createSelector(
    selectFilters,
    (filters) => filters.sortBy
);

// Filtered products selector - now just returns products with pricing since filtering is done server-side
export const selectFilteredProducts = createSelector(
    selectProductsWithPricing,
    (products) => products
);

// Get product by ID with pricing
export const selectProductById = (productId: string) => createSelector(
    selectProductsWithPricing,
    (products: ProductWithPricing[]) => products.find(p => p.id === productId)
);

// Pagination selectors
export const selectPagination = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.pagination
);

export const selectCurrentPage = createSelector(
    selectPagination,
    (pagination) => pagination.currentPage
);

export const selectItemsPerPage = createSelector(
    selectPagination,
    (pagination) => pagination.itemsPerPage
);

export const selectTotalItems = createSelector(
    selectPagination,
    (pagination) => pagination.totalItems
);

export const selectTotalPages = createSelector(
    selectPagination,
    (pagination) => pagination.totalPages
);

// Paginated products selector - now just returns all products since server-side pagination is handled
export const selectPaginatedProducts = createSelector(
    selectProductsWithPricing,
    (products) => products
);

// Pagination info selector (for displaying pagination details)
export const selectPaginationInfo = createSelector(
    selectPagination,
    (pagination) => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
        const endIndex = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
        
        return {
            ...pagination,
            startIndex,
            endIndex
        };
    }
);

// Dynamic filter selectors
export const selectAllManufacturers = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.allManufacturers
);

export const selectCategoryCounts = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.categoryCounts
);

export const selectManufacturersLoading = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.manufacturersLoading
);

export const selectCategoryCountsLoading = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.categoryCountsLoading
);

export const selectManufacturerCounts = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.manufacturerCounts
);

export const selectManufacturerCountsLoading = createSelector(
    selectProductsFeature,
    (state: ProductsState) => state.manufacturerCountsLoading
); 