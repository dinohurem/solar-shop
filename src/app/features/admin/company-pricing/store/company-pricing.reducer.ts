import { createReducer, on } from '@ngrx/store';
import { AdminCompanyPricingState, initialAdminCompanyPricingState } from '../../store/admin.state';
import * as CompanyPricingActions from './company-pricing.actions';

export const companyPricingReducer = createReducer(
    initialAdminCompanyPricingState,

    // Load companies
    on(CompanyPricingActions.loadCompanies, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompanyPricingActions.loadCompaniesSuccess, (state, { companies }) => ({
        ...state,
        companies,
        loading: false,
        error: null
    })),

    on(CompanyPricingActions.loadCompaniesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Load products
    on(CompanyPricingActions.loadProducts, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompanyPricingActions.loadProductsSuccess, (state, { products }) => ({
        ...state,
        products,
        loading: false,
        error: null
    })),

    on(CompanyPricingActions.loadProductsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Load company pricing
    on(CompanyPricingActions.loadCompanyPricing, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompanyPricingActions.loadCompanyPricingSuccess, (state, { companyPricing }) => ({
        ...state,
        companyPricing,
        loading: false,
        error: null
    })),

    on(CompanyPricingActions.loadCompanyPricingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Create company pricing
    on(CompanyPricingActions.createCompanyPricing, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompanyPricingActions.createCompanyPricingSuccess, (state, { pricing }) => ({
        ...state,
        companyPricing: [...state.companyPricing, pricing],
        loading: false,
        error: null
    })),

    on(CompanyPricingActions.createCompanyPricingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update company pricing
    on(CompanyPricingActions.updateCompanyPricing, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompanyPricingActions.updateCompanyPricingSuccess, (state, { pricing }) => ({
        ...state,
        companyPricing: state.companyPricing.map(p =>
            p.id === pricing.id ? pricing : p
        ),
        loading: false,
        error: null
    })),

    on(CompanyPricingActions.updateCompanyPricingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Delete company pricing
    on(CompanyPricingActions.deleteCompanyPricing, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompanyPricingActions.deleteCompanyPricingSuccess, (state, { id }) => ({
        ...state,
        companyPricing: state.companyPricing.filter(p => p.id !== id),
        loading: false,
        error: null
    })),

    on(CompanyPricingActions.deleteCompanyPricingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Select company pricing
    on(CompanyPricingActions.selectCompanyPricing, (state, { pricing }) => ({
        ...state,
        selectedPricing: pricing
    })),

    // Clear state
    on(CompanyPricingActions.clearCompanyPricingState, () => initialAdminCompanyPricingState)
); 