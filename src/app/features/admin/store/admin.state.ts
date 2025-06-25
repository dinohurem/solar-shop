import { Order } from '../../../shared/models/order.model';
import { User } from '../../../shared/models/user.model';

// Individual sub-state interfaces
export interface AdminOrdersState {
    orders: Order[];
    loading: boolean;
    error: string | null;
    selectedOrder: Order | null;
}

export interface AdminUsersState {
    users: User[];
    loading: boolean;
    error: string | null;
    selectedUser: User | null;
}

export interface AdminCategoriesState {
    categories: any[];
    loading: boolean;
    error: string | null;
    selectedCategory: any | null;
}

export interface AdminReviewsState {
    reviews: any[];
    loading: boolean;
    error: string | null;
    selectedReview: any | null;
}

export interface AdminProductsState {
    products: any[];
    loading: boolean;
    error: string | null;
    selectedProduct: any | null;
}

export interface AdminCompaniesState {
    companies: any[];
    loading: boolean;
    error: string | null;
    selectedCompany: any | null;
}

export interface AdminCompanyPricingState {
    companyPricing: any[];
    companies: any[];
    products: any[];
    loading: boolean;
    error: string | null;
    selectedPricing: any | null;
}

// Main admin state interface
export interface AdminState {
    orders: AdminOrdersState;
    users: AdminUsersState;
    categories: AdminCategoriesState;
    reviews: AdminReviewsState;
    products: AdminProductsState;
    companies: AdminCompaniesState;
    companyPricing: AdminCompanyPricingState;
}

// Initial state values
export const initialAdminOrdersState: AdminOrdersState = {
    orders: [],
    loading: false,
    error: null,
    selectedOrder: null
};

export const initialAdminUsersState: AdminUsersState = {
    users: [],
    loading: false,
    error: null,
    selectedUser: null
};

export const initialAdminCategoriesState: AdminCategoriesState = {
    categories: [],
    loading: false,
    error: null,
    selectedCategory: null
};

export const initialAdminReviewsState: AdminReviewsState = {
    reviews: [],
    loading: false,
    error: null,
    selectedReview: null
};

export const initialAdminProductsState: AdminProductsState = {
    products: [],
    loading: false,
    error: null,
    selectedProduct: null
};

export const initialAdminCompaniesState: AdminCompaniesState = {
    companies: [],
    loading: false,
    error: null,
    selectedCompany: null
};

export const initialAdminCompanyPricingState: AdminCompanyPricingState = {
    companyPricing: [],
    companies: [],
    products: [],
    loading: false,
    error: null,
    selectedPricing: null
};

export const initialAdminState: AdminState = {
    orders: initialAdminOrdersState,
    users: initialAdminUsersState,
    categories: initialAdminCategoriesState,
    reviews: initialAdminReviewsState,
    products: initialAdminProductsState,
    companies: initialAdminCompaniesState,
    companyPricing: initialAdminCompanyPricingState
}; 