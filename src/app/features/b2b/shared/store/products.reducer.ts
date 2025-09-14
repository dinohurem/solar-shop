import { createReducer, on } from '@ngrx/store';
import { Product, CompanyPricing, Category } from './products.actions';
import * as ProductsActions from './products.actions';

export interface ProductFilters {
    categories: string[];
    manufacturers: string[];
    searchQuery: string;
    availability: string;
    sortBy: string;
}

export interface PaginationState {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export interface ProductsState {
    products: Product[];
    categories: Category[];
    companyPricing: CompanyPricing[];
    selectedProduct: Product | null;
    filters: ProductFilters;
    pagination: PaginationState;
    loading: boolean;
    categoriesLoading: boolean;
    error: string | null;
    allManufacturers: string[];
    categoryCounts: { [categoryName: string]: number };
    manufacturerCounts: { [manufacturerName: string]: number };
    manufacturersLoading: boolean;
    categoryCountsLoading: boolean;
    manufacturerCountsLoading: boolean;
}

export const initialState: ProductsState = {
    products: [],
    categories: [],
    companyPricing: [],
    selectedProduct: null,
    filters: {
        categories: [],
        manufacturers: [],
        searchQuery: '',
        availability: '',
        sortBy: 'name'
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 12,
        totalItems: 0,
        totalPages: 0
    },
    loading: false,
    categoriesLoading: false,
    error: null,
    allManufacturers: [],
    categoryCounts: {},
    manufacturerCounts: {},
    manufacturersLoading: false,
    categoryCountsLoading: false,
    manufacturerCountsLoading: false
};

export const productsReducer = createReducer(
    initialState,

    // Load products
    on(ProductsActions.loadProducts, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProductsActions.loadProductsSuccess, (state, { response }) => ({
        ...state,
        products: response.products,
        pagination: {
            ...state.pagination,
            currentPage: response.currentPage,
            totalItems: response.totalItems,
            totalPages: response.totalPages
        },
        loading: false,
        error: null
    })),

    on(ProductsActions.loadProductsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Load company pricing
    on(ProductsActions.loadCompanyPricing, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProductsActions.loadCompanyPricingSuccess, (state, { pricing }) => ({
        ...state,
        companyPricing: pricing,
        loading: false,
        error: null
    })),

    on(ProductsActions.loadCompanyPricingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Load single product
    on(ProductsActions.loadProduct, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProductsActions.loadProductSuccess, (state, { product }) => ({
        ...state,
        selectedProduct: product,
        loading: false,
        error: null
    })),

    on(ProductsActions.loadProductFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Clear error
    on(ProductsActions.clearProductsError, (state) => ({
        ...state,
        error: null
    })),

    // Load categories
    on(ProductsActions.loadCategories, (state) => ({
        ...state,
        categoriesLoading: true,
        error: null
    })),

    on(ProductsActions.loadCategoriesSuccess, (state, { categories }) => ({
        ...state,
        categories,
        categoriesLoading: false,
        error: null
    })),

    on(ProductsActions.loadCategoriesFailure, (state, { error }) => ({
        ...state,
        categoriesLoading: false,
        error
    })),

    // Filtering actions
    on(ProductsActions.setSearchQuery, (state, { query }) => ({
        ...state,
        filters: {
            ...state.filters,
            searchQuery: query
        },
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when searching
        }
    })),

    on(ProductsActions.toggleCategoryFilter, (state, { category, checked }) => ({
        ...state,
        filters: {
            ...state.filters,
            categories: checked
                ? [...state.filters.categories, category]
                : state.filters.categories.filter(c => c !== category)
        },
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when filtering
        }
    })),

    on(ProductsActions.setAvailabilityFilter, (state, { availability }) => ({
        ...state,
        filters: {
            ...state.filters,
            availability
        },
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when filtering
        }
    })),

    on(ProductsActions.setSortOption, (state, { sortBy }) => ({
        ...state,
        filters: {
            ...state.filters,
            sortBy
        }
    })),

    on(ProductsActions.toggleManufacturerFilter, (state, { manufacturer, checked }) => ({
        ...state,
        filters: {
            ...state.filters,
            manufacturers: checked
                ? [...state.filters.manufacturers, manufacturer]
                : state.filters.manufacturers.filter(m => m !== manufacturer)
        },
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when filtering
        }
    })),

    on(ProductsActions.clearFilters, (state) => ({
        ...state,
        filters: {
            categories: [],
            manufacturers: [],
            searchQuery: '',
            availability: '',
            sortBy: 'name'
        },
        pagination: {
            ...state.pagination,
            currentPage: 1 // Reset to first page when clearing filters
        }
    })),

    // Pagination actions
    on(ProductsActions.setCurrentPage, (state, { page }) => ({
        ...state,
        pagination: {
            ...state.pagination,
            currentPage: page
        }
    })),

    on(ProductsActions.setItemsPerPage, (state, { itemsPerPage }) => ({
        ...state,
        pagination: {
            ...state.pagination,
            itemsPerPage,
            currentPage: 1 // Reset to first page when changing items per page
        }
    })),

    on(ProductsActions.updatePaginationInfo, (state, { totalItems, totalPages }) => ({
        ...state,
        pagination: {
            ...state.pagination,
            totalItems,
            totalPages
        }
    })),

    // Load all manufacturers
    on(ProductsActions.loadAllManufacturers, (state) => ({
        ...state,
        manufacturersLoading: true,
        error: null
    })),

    on(ProductsActions.loadAllManufacturersSuccess, (state, { manufacturers }) => ({
        ...state,
        allManufacturers: manufacturers,
        manufacturersLoading: false,
        error: null
    })),

    on(ProductsActions.loadAllManufacturersFailure, (state, { error }) => ({
        ...state,
        manufacturersLoading: false,
        error
    })),

    // Load category counts
    on(ProductsActions.loadCategoryCounts, (state) => ({
        ...state,
        categoryCountsLoading: true,
        error: null
    })),

    on(ProductsActions.loadCategoryCountsSuccess, (state, { categoryCounts }) => ({
        ...state,
        categoryCounts,
        categoryCountsLoading: false,
        error: null
    })),

    on(ProductsActions.loadCategoryCountsFailure, (state, { error }) => ({
        ...state,
        categoryCountsLoading: false,
        error
    })),

    // Load manufacturer counts
    on(ProductsActions.loadManufacturerCounts, (state) => ({
        ...state,
        manufacturerCountsLoading: true,
        error: null
    })),

    on(ProductsActions.loadManufacturerCountsSuccess, (state, { manufacturerCounts }) => ({
        ...state,
        manufacturerCounts,
        manufacturerCountsLoading: false,
        error: null
    })),

    on(ProductsActions.loadManufacturerCountsFailure, (state, { error }) => ({
        ...state,
        manufacturerCountsLoading: false,
        error
    }))
); 