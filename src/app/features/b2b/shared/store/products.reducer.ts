import { createReducer, on } from '@ngrx/store';
import { Product, CompanyPricing, Category } from './products.actions';
import * as ProductsActions from './products.actions';

export interface ProductsState {
    products: Product[];
    categories: Category[];
    companyPricing: CompanyPricing[];
    selectedProduct: Product | null;
    loading: boolean;
    categoriesLoading: boolean;
    error: string | null;
}

export const initialState: ProductsState = {
    products: [],
    categories: [],
    companyPricing: [],
    selectedProduct: null,
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
    }))
); 