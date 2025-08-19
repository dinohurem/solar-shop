import { createReducer, on } from '@ngrx/store';
import { Product, CompanyPricing, Category } from './products.actions';
import * as ProductsActions from './products.actions';

export interface ProductFilters {
    categories: string[];
    searchQuery: string;
    availability: string;
    sortBy: string;
}

export interface ProductsState {
    products: Product[];
    categories: Category[];
    companyPricing: CompanyPricing[];
    selectedProduct: Product | null;
    filters: ProductFilters;
    loading: boolean;
    categoriesLoading: boolean;
    error: string | null;
}

export const initialState: ProductsState = {
    products: [],
    categories: [],
    companyPricing: [],
    selectedProduct: null,
    filters: {
        categories: [],
        searchQuery: '',
        availability: '',
        sortBy: 'name'
    },
    loading: false,
    categoriesLoading: false,
    error: null
};

export const productsReducer = createReducer(
    initialState,

    // Load products
    on(ProductsActions.loadProducts, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(ProductsActions.loadProductsSuccess, (state, { products }) => ({
        ...state,
        products,
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
        }
    })),

    on(ProductsActions.toggleCategoryFilter, (state, { category, checked }) => ({
        ...state,
        filters: {
            ...state.filters,
            categories: checked
                ? [...state.filters.categories, category]
                : state.filters.categories.filter(c => c !== category)
        }
    })),

    on(ProductsActions.setAvailabilityFilter, (state, { availability }) => ({
        ...state,
        filters: {
            ...state.filters,
            availability
        }
    })),

    on(ProductsActions.setSortOption, (state, { sortBy }) => ({
        ...state,
        filters: {
            ...state.filters,
            sortBy
        }
    })),

    on(ProductsActions.clearFilters, (state) => ({
        ...state,
        filters: {
            categories: [],
            searchQuery: '',
            availability: '',
            sortBy: 'name'
        }
    }))
); 