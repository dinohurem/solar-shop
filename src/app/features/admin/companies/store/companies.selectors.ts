import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CompaniesState } from './companies.state';

export const selectCompaniesState = createFeatureSelector<CompaniesState>('companies');

export const selectAllCompanies = createSelector(
    selectCompaniesState,
    (state) => state.companies
);

export const selectFilteredCompanies = createSelector(
    selectCompaniesState,
    (state) => state.filteredCompanies
);

export const selectCompaniesLoading = createSelector(
    selectCompaniesState,
    (state) => state.loading
);

export const selectCompaniesError = createSelector(
    selectCompaniesState,
    (state) => state.error
);

export const selectCompaniesFilters = createSelector(
    selectCompaniesState,
    (state) => state.filters
);

export const selectCompaniesApproving = createSelector(
    selectCompaniesState,
    (state) => state.approving
);

export const selectCompaniesRejecting = createSelector(
    selectCompaniesState,
    (state) => state.rejecting
);

export const selectCompaniesDeleting = createSelector(
    selectCompaniesState,
    (state) => state.deleting
);

// Statistics selectors
export const selectTotalCompanies = createSelector(
    selectAllCompanies,
    (companies) => companies.length
);

export const selectPendingCompanies = createSelector(
    selectAllCompanies,
    (companies) => companies.filter(c => c.status === 'pending').length
);

export const selectApprovedCompanies = createSelector(
    selectAllCompanies,
    (companies) => companies.filter(c => c.status === 'approved').length
);

export const selectRejectedCompanies = createSelector(
    selectAllCompanies,
    (companies) => companies.filter(c => c.status === 'rejected').length
);

// Individual company selector
export const selectCompanyById = (id: string) => createSelector(
    selectAllCompanies,
    (companies) => companies.find(company => company.id === id)
); 