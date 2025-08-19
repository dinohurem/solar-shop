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

export const selectAvailabilityFilter = createSelector(
    selectFilters,
    (filters) => filters.availability
);

export const selectSortBy = createSelector(
    selectFilters,
    (filters) => filters.sortBy
);

// Filtered products selector
export const selectFilteredProducts = createSelector(
    selectProductsWithPricing,
    selectFilters,
    (products, filters) => {
        let filteredProducts = products.filter(product => {
            // Search filter
            const matchesSearch = !filters.searchQuery ||
                product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                product.short_description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                product.sku.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                product.brand?.toLowerCase().includes(filters.searchQuery.toLowerCase());

            // Category filter
            const matchesCategory = filters.categories.length === 0 ||
                filters.categories.some(filterCategory => 
                    product.category?.toLowerCase().includes(filterCategory.toLowerCase()) ||
                    (product.categories && product.categories.some(cat => 
                        cat.name.toLowerCase().includes(filterCategory.toLowerCase())
                    ))
                );

            // Availability filter
            const matchesAvailability = !filters.availability ||
                (filters.availability === 'in-stock' && product.in_stock) ||
                (filters.availability === 'partner-only' && product.partner_only);

            return matchesSearch && matchesCategory && matchesAvailability;
        });

        // Sort products
        filteredProducts.sort((a, b) => {
            switch (filters.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price-low':
                    const priceA = a.company_price || a.partner_price || a.price;
                    const priceB = b.company_price || b.partner_price || b.price;
                    return priceA - priceB;
                case 'price-high':
                    const priceA2 = a.company_price || a.partner_price || a.price;
                    const priceB2 = b.company_price || b.partner_price || b.price;
                    return priceB2 - priceA2;
                case 'savings':
                    return (b.savings || 0) - (a.savings || 0);
                default:
                    return 0;
            }
        });

        return filteredProducts;
    }
);

// Get product by ID with pricing
export const selectProductById = (productId: string) => createSelector(
    selectProductsWithPricing,
    (products: ProductWithPricing[]) => products.find(p => p.id === productId)
); 