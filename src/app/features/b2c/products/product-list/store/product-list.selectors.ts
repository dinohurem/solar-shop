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

export const selectPagination = createSelector(
    selectProductListState,
    (state: ProductListState) => state.pagination
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
    (products) => products // Server-side filtering handles this now
);

export const selectTotalPages = createSelector(
    selectPagination,
    (pagination) => Math.ceil(pagination.totalItems / pagination.itemsPerPage)
);

export const selectPaginatedProducts = createSelector(
    selectProducts,
    (products) => products // Server-side pagination handles this now
);

export const selectPaginationInfo = createSelector(
    selectPagination,
    (pagination) => ({
        ...pagination,
        totalPages: Math.ceil(pagination.totalItems / pagination.itemsPerPage),
        startIndex: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
        endIndex: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)
    })
);

export const selectCachedPages = createSelector(
    selectProductListState,
    (state: ProductListState) => state.cachedPages
);

export const selectLastQuery = createSelector(
    selectProductListState,
    (state: ProductListState) => state.lastQuery
); 