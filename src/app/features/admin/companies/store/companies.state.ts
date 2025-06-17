import { Company } from '../../../../shared/models/company.model';

export interface CompaniesFilters {
    status?: string;
    businessType?: string;
    searchTerm?: string;
    dateRange?: string;
}

export interface CompaniesState {
    companies: Company[];
    filteredCompanies: Company[];
    filters: CompaniesFilters;
    loading: boolean;
    error: string | null;
    approving: boolean;
    rejecting: boolean;
    deleting: boolean;
} 