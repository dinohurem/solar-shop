import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../../services/supabase.service';
import { CompanyRegistrationData } from '../../../../shared/models/company.model';

@Injectable({
    providedIn: 'root'
})
export class PartnerRegistrationService {
    constructor(private supabase: SupabaseService) {}

    async registerPartner(data: CompanyRegistrationData): Promise<{ error?: string }> {
        try {
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

            const { error: companyError } = await this.supabase.client
                .from('companies')
                .insert({
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
                    website: data.website,
                    business_type: data.businessType,
                    years_in_business: data.yearsInBusiness,
                    annual_revenue: data.annualRevenue,
                    number_of_employees: data.numberOfEmployees,
                    description: data.description
                });

            if (companyError) {
                return { error: companyError.message };
            }

            return {};
        } catch (err: any) {
            return { error: err.message };
        }
    }
}
