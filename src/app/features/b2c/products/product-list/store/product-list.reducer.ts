import { createReducer, on } from '@ngrx/store';
import { Product, ProductFilters, SortOption, PaginationState } from '../product-list.component';
import { ProductListActions } from './product-list.actions';

export interface CachedPage {
    products: Product[];
    timestamp: number;
    query: string; // Serialized query for cache invalidation
}

export interface ProductListState {
    products: Product[];
    loading: boolean;
    error: string | null;
    filters: ProductFilters;
    sortOption: SortOption;
    searchQuery: string;
    pagination: PaginationState;
    cachedPages: { [pageKey: string]: CachedPage };
    lastQuery: string;
    allManufacturers: string[];
    categoryCounts: { [categoryName: string]: number };
    manufacturerCounts: { [manufacturerName: string]: number };
    manufacturersLoading: boolean;
    categoryCountsLoading: boolean;
    manufacturerCountsLoading: boolean;
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
        itemsPerPage: 12,
        totalItems: 0
    },
    cachedPages: {},
    lastQuery: '',
    allManufacturers: [],
    categoryCounts: {},
    manufacturerCounts: {},
    manufacturersLoading: false,
    categoryCountsLoading: false,
    manufacturerCountsLoading: false
};

export const productListReducer = createReducer(
    initialState,

    on(ProductListActions.loadProducts, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProductListActions.loadProductsSuccess, (state, { response }) => {
        // Create a query key for caching
        const queryKey = JSON.stringify({
            searchQuery: state.searchQuery,
            filters: state.filters,
            sortOption: state.sortOption,
            itemsPerPage: state.pagination.itemsPerPage
        });
        
        // Create page key
        const pageKey = `${queryKey}_page_${response.currentPage}`;
        
        // Cache the page
        const cachedPage: CachedPage = {
            products: response.products,
            timestamp: Date.now(),
            query: queryKey
        };
        
        return {
            ...state,
            products: response.products,
            pagination: {
                ...state.pagination,
                currentPage: response.currentPage,
                totalItems: response.totalItems
            },
            cachedPages: {
                ...state.cachedPages,
                [pageKey]: cachedPage
            },
            lastQuery: queryKey,
            loading: false,
            error: null
        };
    }),

    on(ProductListActions.loadProductsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(ProductListActions.loadProductsFromCache, (state, { products, currentPage }) => ({
        ...state,
        products,
        pagination: {
            ...state.pagination,
            currentPage
        },
        loading: false,
        error: null
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
        },
        cachedPages: {} // Clear cache when filters change
    })),

    on(ProductListActions.updatePriceRange, (state, { rangeType, value }) => ({
        ...state,
        filters: {
            ...state.filters,
            priceRange: {
                ...state.filters.priceRange,
                [rangeType]: value
            }
        },
        cachedPages: {} // Clear cache when filters change
    })),

    on(ProductListActions.toggleCertificateFilter, (state, { certificate, checked }) => ({
        ...state,
        filters: {
            ...state.filters,
            certificates: checked
                ? [...state.filters.certificates, certificate]
                : state.filters.certificates.filter(c => c !== certificate)
        },
        cachedPages: {} // Clear cache when filters change
    })),

    on(ProductListActions.toggleManufacturerFilter, (state, { manufacturer, checked }) => ({
        ...state,
        filters: {
            ...state.filters,
            manufacturers: checked
                ? [...state.filters.manufacturers, manufacturer]
                : state.filters.manufacturers.filter(m => m !== manufacturer)
        },
        cachedPages: {} // Clear cache when filters change
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
        },
        cachedPages: {} // Clear cache when clearing filters
    })),

    on(ProductListActions.updateSortOption, (state, { sortOption }) => ({
        ...state,
        sortOption,
        cachedPages: {} // Clear cache when sort changes
    })),

    on(ProductListActions.searchProducts, (state, { query }) => ({
        ...state,
        searchQuery: query,
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when searching
        },
        cachedPages: {} // Clear cache when search changes
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
    })),

    on(ProductListActions.loadAllManufacturers, (state) => ({
        ...state,
        manufacturersLoading: true
    })),

    on(ProductListActions.loadAllManufacturersSuccess, (state, { manufacturers }) => ({
        ...state,
        allManufacturers: manufacturers,
        manufacturersLoading: false
    })),

    on(ProductListActions.loadAllManufacturersFailure, (state, { error }) => ({
        ...state,
        manufacturersLoading: false,
        error
    })),

    on(ProductListActions.loadCategoryCounts, (state) => ({
        ...state,
        categoryCountsLoading: true
    })),

    on(ProductListActions.loadCategoryCountsSuccess, (state, { categoryCounts }) => ({
        ...state,
        categoryCounts,
        categoryCountsLoading: false
    })),

    on(ProductListActions.loadCategoryCountsFailure, (state, { error }) => ({
        ...state,
        categoryCountsLoading: false,
        error
    })),

    on(ProductListActions.loadManufacturerCounts, (state) => ({
        ...state,
        manufacturerCountsLoading: true
    })),

    on(ProductListActions.loadManufacturerCountsSuccess, (state, { manufacturerCounts }) => ({
        ...state,
        manufacturerCounts,
        manufacturerCountsLoading: false
    })),

    on(ProductListActions.loadManufacturerCountsFailure, (state, { error }) => ({
        ...state,
        manufacturerCountsLoading: false,
        error
    }))
); 