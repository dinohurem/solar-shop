import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../../services/supabase.service';
import { CompanyRegistrationData } from '../../../../shared/models/company.model';

@Injectable({
    providedIn: 'root'
})
export class PartnerRegistrationService {
    constructor(private supabase: SupabaseService) { }

    async registerPartner(data: CompanyRegistrationData): Promise<{ error?: string }> {
        try {
            // First, create the user account
            const response = await this.supabase.signUp({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phoneNumber || undefined
            });

            if (response.error || !response.user) {
                return { error: response.error || 'Registration failed' };
            }

            // Prepare company data with proper handling of optional numeric fields
            const companyData = {
                contact_person_id: response.user.id,
                contact_person_name: `${data.firstName} ${data.lastName}`,
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                phone_number: data.phoneNumber,
                address: data.address,
                company_name: data.companyName,
                tax_number: data.taxNumber,
                company_address: data.companyAddress,
                company_phone: data.companyPhone,
                company_email: data.companyEmail,
                website: data.website || null,
                business_type: data.businessType,
                years_in_business: data.yearsInBusiness,
                annual_revenue: data.annualRevenue && data.annualRevenue > 0 ? data.annualRevenue : null,
                number_of_employees: data.numberOfEmployees && data.numberOfEmployees > 0 ? data.numberOfEmployees : null,
                description: data.description || null
            };

            // Insert the company record - now allowed by the public registration policy
            const { error: companyError } = await this.supabase.client
                .from('companies')
                .insert(companyData);

            if (companyError) {
                console.error('Company creation failed:', companyError);
                return { error: companyError.message };
            }

            return {};
        } catch (err: any) {
            return { error: err.message };
        }
    }
}
