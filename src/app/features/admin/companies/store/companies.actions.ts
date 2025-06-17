import { createAction, props } from '@ngrx/store';
import { Company } from '../../../../shared/models/company.model';

// Load companies actions
export const loadCompanies = createAction('[Admin Companies] Load Companies');

export const loadCompaniesSuccess = createAction(
    '[Admin Companies] Load Companies Success',
    props<{ companies: Company[] }>()
);

export const loadCompaniesFailure = createAction(
    '[Admin Companies] Load Companies Failure',
    props<{ error: string }>()
);

// Approve company actions
export const approveCompany = createAction(
    '[Admin Companies] Approve Company',
    props<{ companyId: string }>()
);

export const approveCompanySuccess = createAction(
    '[Admin Companies] Approve Company Success',
    props<{ company: Company }>()
);

export const approveCompanyFailure = createAction(
    '[Admin Companies] Approve Company Failure',
    props<{ error: string }>()
);

// Reject company actions
export const rejectCompany = createAction(
    '[Admin Companies] Reject Company',
    props<{ companyId: string, reason: string }>()
);

export const rejectCompanySuccess = createAction(
    '[Admin Companies] Reject Company Success',
    props<{ company: Company }>()
);

export const rejectCompanyFailure = createAction(
    '[Admin Companies] Reject Company Failure',
    props<{ error: string }>()
);

// Delete company actions
export const deleteCompany = createAction(
    '[Admin Companies] Delete Company',
    props<{ companyId: string }>()
);

export const deleteCompanySuccess = createAction(
    '[Admin Companies] Delete Company Success',
    props<{ companyId: string }>()
);

export const deleteCompanyFailure = createAction(
    '[Admin Companies] Delete Company Failure',
    props<{ error: string }>()
);

// Filter actions
export const setFilters = createAction(
    '[Admin Companies] Set Filters',
    props<{
        status?: string;
        businessType?: string;
        searchTerm?: string;
        dateRange?: string;
    }>()
);

export const clearFilters = createAction('[Admin Companies] Clear Filters'); 