import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AdminCompanyPricingState } from '../../store/admin.state';

export const selectCompanyPricingState = createFeatureSelector<AdminCompanyPricingState>('companyPricing');

export const selectCompanyPricing = createSelector(
    selectCompanyPricingState,
    (state: AdminCompanyPricingState) => state.companyPricing
);

export const selectCompanies = createSelector(
    selectCompanyPricingState,
    (state: AdminCompanyPricingState) => state.companies
);

export const selectProducts = createSelector(
    selectCompanyPricingState,
    (state: AdminCompanyPricingState) => state.products
);

export const selectCompanyPricingLoading = createSelector(
    selectCompanyPricingState,
    (state: AdminCompanyPricingState) => state.loading
);

export const selectCompanyPricingError = createSelector(
    selectCompanyPricingState,
    (state: AdminCompanyPricingState) => state.error
);

export const selectSelectedCompanyPricing = createSelector(
    selectCompanyPricingState,
    (state: AdminCompanyPricingState) => state.selectedPricing
); 