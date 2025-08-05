import { createReducer, on } from '@ngrx/store';
import { Product, ProductFilters, SortOption, PaginationState } from '../product-list.component';
import { ProductListActions } from './product-list.actions';

export interface ProductListState {
    products: Product[];
    loading: boolean;
    error: string | null;
    filters: ProductFilters;
    sortOption: SortOption;
    searchQuery: string;
    pagination: PaginationState;
}

const initialState: ProductListState = {
    products: [],
    loading: false,
    error: null,
    filters: {
        categories: [],
        priceRange: { min: 0, max: 0 },
        certificates: [],
        manufacturers: []
    },
    sortOption: 'featured',
    searchQuery: '',
    pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0
    }
};

export const productListReducer = createReducer(
    initialState,

    on(ProductListActions.loadProducts, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProductListActions.loadProductsSuccess, (state, { products }) => ({
        ...state,
        products,
        loading: false,
        error: null
    })),

    on(ProductListActions.loadProductsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(ProductListActions.toggleCategoryFilter, (state, { category, checked }) => ({
        ...state,
        filters: {
            ...state.filters,
            categories: checked
                ? [...state.filters.categories, category]
                : state.filters.categories.filter(c => c !== category)
        },
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when filters change
        }
    })),

    on(ProductListActions.updatePriceRange, (state, { rangeType, value }) => ({
        ...state,
        filters: {
            ...state.filters,
            priceRange: {
                ...state.filters.priceRange,
                [rangeType]: value
            }
        }
    })),

    on(ProductListActions.toggleCertificateFilter, (state, { certificate, checked }) => ({
        ...state,
        filters: {
            ...state.filters,
            certificates: checked
                ? [...state.filters.certificates, certificate]
                : state.filters.certificates.filter(c => c !== certificate)
        }
    })),

    on(ProductListActions.toggleManufacturerFilter, (state, { manufacturer, checked }) => ({
        ...state,
        filters: {
            ...state.filters,
            manufacturers: checked
                ? [...state.filters.manufacturers, manufacturer]
                : state.filters.manufacturers.filter(m => m !== manufacturer)
        }
    })),

    on(ProductListActions.clearFilters, (state) => ({
        ...state,
        filters: {
            categories: [],
            priceRange: { min: 0, max: 0 },
            certificates: [],
            manufacturers: []
        },
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when clearing filters
        }
    })),

    on(ProductListActions.updateSortOption, (state, { sortOption }) => ({
        ...state,
        sortOption
    })),

    on(ProductListActions.searchProducts, (state, { query }) => ({
        ...state,
        searchQuery: query,
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when searching
        }
    })),

    on(ProductListActions.setCurrentPage, (state, { page }) => ({
        ...state,
        pagination: {
            ...state.pagination,
            currentPage: page
        }
    })),

    on(ProductListActions.setItemsPerPage, (state, { itemsPerPage }) => ({
        ...state,
        pagination: {
            ...state.pagination,
            itemsPerPage,
            currentPage: 1 // Reset to first page when changing items per page
        }
    })),

    on(ProductListActions.updateTotalItems, (state, { totalItems }) => ({
        ...state,
        pagination: {
            ...state.pagination,
            totalItems
        }
    }))
); 