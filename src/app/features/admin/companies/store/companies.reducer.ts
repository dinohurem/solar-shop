import { createReducer, on } from '@ngrx/store';
import { CompaniesState } from './companies.state';
import * as CompaniesActions from './companies.actions';

export const initialState: CompaniesState = {
    companies: [],
    filteredCompanies: [],
    filters: {},
    loading: false,
    error: null,
    approving: false,
    rejecting: false,
    deleting: false
};

export const companiesReducer = createReducer(
    initialState,

    // Load companies
    on(CompaniesActions.loadCompanies, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompaniesActions.loadCompaniesSuccess, (state, { companies }) => ({
        ...state,
        companies,
        filteredCompanies: filterCompanies(companies, state.filters),
        loading: false,
        error: null
    })),

    on(CompaniesActions.loadCompaniesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Approve company
    on(CompaniesActions.approveCompany, (state) => ({
        ...state,
        approving: true,
        error: null
    })),

    on(CompaniesActions.approveCompanySuccess, (state, { company }) => {
        const updatedCompanies = state.companies.map(c =>
            c.id === company.id ? company : c
        );
        return {
            ...state,
            companies: updatedCompanies,
            filteredCompanies: filterCompanies(updatedCompanies, state.filters),
            approving: false,
            error: null
        };
    }),

    on(CompaniesActions.approveCompanyFailure, (state, { error }) => ({
        ...state,
        approving: false,
        error
    })),

    // Reject company
    on(CompaniesActions.rejectCompany, (state) => ({
        ...state,
        rejecting: true,
        error: null
    })),

    on(CompaniesActions.rejectCompanySuccess, (state, { company }) => {
        const updatedCompanies = state.companies.map(c =>
            c.id === company.id ? company : c
        );
        return {
            ...state,
            companies: updatedCompanies,
            filteredCompanies: filterCompanies(updatedCompanies, state.filters),
            rejecting: false,
            error: null
        };
    }),

    on(CompaniesActions.rejectCompanyFailure, (state, { error }) => ({
        ...state,
        rejecting: false,
        error
    })),

    // Delete company
    on(CompaniesActions.deleteCompany, (state) => ({
        ...state,
        deleting: true,
        error: null
    })),

    on(CompaniesActions.deleteCompanySuccess, (state, { companyId }) => {
        const updatedCompanies = state.companies.filter(c => c.id !== companyId);
        return {
            ...state,
            companies: updatedCompanies,
            filteredCompanies: filterCompanies(updatedCompanies, state.filters),
            deleting: false,
            error: null
        };
    }),

    on(CompaniesActions.deleteCompanyFailure, (state, { error }) => ({
        ...state,
        deleting: false,
        error
    })),

    // Filters
    on(CompaniesActions.setFilters, (state, { status, businessType, searchTerm, dateRange }) => {
        const newFilters = {
            ...state.filters,
            ...(status !== undefined && { status }),
            ...(businessType !== undefined && { businessType }),
            ...(searchTerm !== undefined && { searchTerm }),
            ...(dateRange !== undefined && { dateRange })
        };
        return {
            ...state,
            filters: newFilters,
            filteredCompanies: filterCompanies(state.companies, newFilters)
        };
    }),

    on(CompaniesActions.clearFilters, (state) => ({
        ...state,
        filters: {},
        filteredCompanies: state.companies
    })),

    // Create company
    on(CompaniesActions.createCompany, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompaniesActions.createCompanySuccess, (state, { company }) => {
        const updatedCompanies = [...state.companies, company];
        return {
            ...state,
            companies: updatedCompanies,
            filteredCompanies: filterCompanies(updatedCompanies, state.filters),
            loading: false,
            error: null
        };
    }),

    on(CompaniesActions.createCompanyFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update company
    on(CompaniesActions.updateCompany, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(CompaniesActions.updateCompanySuccess, (state, { company }) => {
        const updatedCompanies = state.companies.map(c =>
            c.id === company.id ? company : c
        );
        return {
            ...state,
            companies: updatedCompanies,
            filteredCompanies: filterCompanies(updatedCompanies, state.filters),
            loading: false,
            error: null
        };
    }),

    on(CompaniesActions.updateCompanyFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);

// Helper function to filter companies
function filterCompanies(companies: any[], filters: any): any[] {
    return companies.filter(company => {
        const matchesStatus = !filters.status || company.status === filters.status;
        const matchesBusinessType = !filters.businessType || company.businessType === filters.businessType;
        const matchesSearch = !filters.searchTerm ||
            company.companyName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            company.contactPersonName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            company.companyEmail?.toLowerCase().includes(filters.searchTerm.toLowerCase());

        let matchesDate = true;
        if (filters.dateRange) {
            const now = new Date();
            const companyDate = new Date(company.createdAt);

            switch (filters.dateRange) {
                case 'today':
                    matchesDate = companyDate.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = companyDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    matchesDate = companyDate >= monthAgo;
                    break;
            }
        }

        return matchesStatus && matchesBusinessType && matchesSearch && matchesDate;
    });
} 