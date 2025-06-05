import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductListState } from './product-list.reducer';
import { Product, SortOption } from '../product-list.component';

export const selectProductListState = createFeatureSelector<ProductListState>('productList');

export const selectProducts = createSelector(
    selectProductListState,
    (state: ProductListState) => state.products
);

export const selectIsLoading = createSelector(
    selectProductListState,
    (state: ProductListState) => state.loading
);

export const selectError = createSelector(
    selectProductListState,
    (state: ProductListState) => state.error
);

export const selectFilters = createSelector(
    selectProductListState,
    (state: ProductListState) => state.filters
);

export const selectSortOption = createSelector(
    selectProductListState,
    (state: ProductListState) => state.sortOption
);

export const selectSearchQuery = createSelector(
    selectProductListState,
    (state: ProductListState) => state.searchQuery
);

export const selectCategories = createSelector(
    selectProducts,
    (products: Product[]) => {
        const categories = products.map(product => product.category);
        return [...new Set(categories)];
    }
);

export const selectManufacturers = createSelector(
    selectProducts,
    (products: Product[]) => {
        const manufacturers = products.map(product => product.manufacturer);
        return [...new Set(manufacturers)];
    }
);

export const selectCertificates = createSelector(
    selectProducts,
    (products: Product[]) => {
        const allCertificates = products.flatMap(product => product.certificates);
        return [...new Set(allCertificates)];
    }
);

export const selectFilteredProducts = createSelector(
    selectProducts,
    selectFilters,
    selectSortOption,
    selectSearchQuery,
    (products, filters, sortOption, searchQuery) => {
        let filtered = products.filter(product => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(query);
                const matchesDescription = product.description.toLowerCase().includes(query);
                if (!matchesName && !matchesDescription) {
                    return false;
                }
            }

            // Category filter
            if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
                return false;
            }

            // Price range filter
            if (filters.priceRange.min > 0 && product.price < filters.priceRange.min) {
                return false;
            }
            if (filters.priceRange.max > 0 && product.price > filters.priceRange.max) {
                return false;
            }

            // Certificate filter
            if (filters.certificates.length > 0) {
                const hasMatchingCertificate = filters.certificates.some(cert =>
                    product.certificates.includes(cert)
                );
                if (!hasMatchingCertificate) {
                    return false;
                }
            }

            // Manufacturer filter
            if (filters.manufacturers.length > 0 && !filters.manufacturers.includes(product.manufacturer)) {
                return false;
            }

            return true;
        });

        // Sort products
        switch (sortOption) {
            case 'featured':
                return filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
            case 'newest':
                return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            case 'name-asc':
                return filtered.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return filtered.sort((a, b) => b.name.localeCompare(a.name));
            case 'price-low':
                return filtered.sort((a, b) => a.price - b.price);
            case 'price-high':
                return filtered.sort((a, b) => b.price - a.price);
            default:
                return filtered;
        }
    }
); 