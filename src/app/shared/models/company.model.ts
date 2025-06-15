export interface Company {
    id: string;
    // Personal Information (from user registration)
    contactPersonId: string; // Reference to the user who registered
    contactPersonName?: string; // Name of the contact person for display purposes

    // Company Information
    companyName: string;
    taxNumber: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    website?: string;

    // Business Details
    businessType: 'retailer' | 'wholesaler' | 'installer' | 'distributor' | 'other';
    yearsInBusiness: number;
    annualRevenue?: number;
    numberOfEmployees?: number;
    description?: string;

    // Status and Approval
    status: 'pending' | 'approved' | 'rejected';
    approved: boolean;
    approvedAt?: Date;
    approvedBy?: string; // Admin user ID
    rejectedAt?: Date;
    rejectedBy?: string; // Admin user ID
    rejectionReason?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Interface for company registration form data
export interface CompanyRegistrationData {
    // Personal Information
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    password: string;
    confirmPassword: string;

    // Company Information
    companyName: string;
    taxNumber: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    website?: string;
    businessType: 'retailer' | 'wholesaler' | 'installer' | 'distributor' | 'other';
    yearsInBusiness: number;
    annualRevenue?: number;
    numberOfEmployees?: number;
    description?: string;
}

export interface CompanyFilters {
    status?: 'pending' | 'approved' | 'rejected';
    businessType?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface CompanyRegistrationData {
    // Personal Information
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    password: string;

    // Company Information
    companyName: string;
    taxNumber: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    website?: string;
    businessType: 'retailer' | 'wholesaler' | 'installer' | 'distributor' | 'other';
    yearsInBusiness: number;
    annualRevenue?: number;
    numberOfEmployees?: number;
    description?: string;
} 