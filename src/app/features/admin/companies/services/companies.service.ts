import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import { Company } from '../../../../shared/models/company.model';

@Injectable({
    providedIn: 'root'
})
export class CompaniesService {

    constructor(private supabaseService: SupabaseService) { }

    getCompanies(): Observable<Company[]> {
        return from(
            this.supabaseService.client
                .from('companies')
                .select(`
          *,
          contact_person:profiles!companies_contact_person_id_fkey(
            full_name
          )
        `)
                .order('created_at', { ascending: false })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return (data || []).map(this.mapDatabaseToModel);
            })
        );
    }

    approveCompany(companyId: string): Observable<Company> {
        return from(
            this.supabaseService.getSession().then(session => {
                const currentUserId = session?.user?.id;
                return this.supabaseService.client
                    .from('companies')
                    .update({
                        status: 'approved',
                        approved: true,
                        approved_at: new Date().toISOString(),
                        approved_by: currentUserId,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', companyId)
                    .select(`
            *,
            contact_person:profiles!companies_contact_person_id_fkey(
              full_name
            )
          `)
                    .single();
            })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapDatabaseToModel(data);
            })
        );
    }

    rejectCompany(companyId: string, reason: string): Observable<Company> {
        return from(
            this.supabaseService.getSession().then(session => {
                const currentUserId = session?.user?.id;
                return this.supabaseService.client
                    .from('companies')
                    .update({
                        status: 'rejected',
                        approved: false,
                        rejected_at: new Date().toISOString(),
                        rejected_by: currentUserId,
                        rejection_reason: reason,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', companyId)
                    .select(`
            *,
            contact_person:profiles!companies_contact_person_id_fkey(
              full_name
            )
          `)
                    .single();
            })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapDatabaseToModel(data);
            })
        );
    }

    deleteCompany(companyId: string): Observable<void> {
        return from(
            this.supabaseService.client
                .from('companies')
                .delete()
                .eq('id', companyId)
        ).pipe(
            map(({ error }) => {
                if (error) throw error;
                return;
            })
        );
    }

    createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Observable<Company> {
        return from(
            this.supabaseService.getSession().then(async () => {
                // Parse first name and last name from contactPersonName
                // Format: "FirstName LastName"
                let firstName = 'Pending';
                let lastName = 'User';

                if (company.contactPersonName) {
                    const nameParts = company.contactPersonName.trim().split(' ');
                    firstName = nameParts[0] || 'Pending';
                    lastName = nameParts.slice(1).join(' ') || 'User';
                }

                // Call Edge Function to create user, profile, and company
                // This uses the service role key on the server side
                const { data, error } = await this.supabaseService.client.functions.invoke('create-company-user', {
                    body: {
                        email: company.companyEmail,
                        firstName,
                        lastName,
                        phoneNumber: company.companyPhone,
                        companyName: company.companyName,
                        taxNumber: company.taxNumber,
                        companyAddress: company.companyAddress,
                        companyPhone: company.companyPhone,
                        companyEmail: company.companyEmail,
                        website: company.website,
                        businessType: company.businessType,
                        yearsInBusiness: company.yearsInBusiness,
                        annualRevenue: company.annualRevenue,
                        numberOfEmployees: company.numberOfEmployees,
                        description: company.description,
                        status: company.status || 'pending'
                    }
                });

                if (error) {
                    console.error('Error calling edge function:', error);
                    throw new Error(`Failed to create company: ${error.message}`);
                }

                if (!data || !data.success) {
                    throw new Error(data?.error || 'Unknown error creating company');
                }

                // Return the created company from the edge function response
                return { data: data.company, error: null };
            })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapDatabaseToModel(data);
            })
        );
    }

    updateCompany(companyId: string, company: Partial<Company>): Observable<Company> {
        return from(
            this.supabaseService.client
                .from('companies')
                .update({
                    ...(company.companyName && { company_name: company.companyName }),
                    ...(company.taxNumber && { tax_number: company.taxNumber }),
                    ...(company.companyAddress && { company_address: company.companyAddress }),
                    ...(company.companyPhone && { company_phone: company.companyPhone }),
                    ...(company.companyEmail && { company_email: company.companyEmail }),
                    ...(company.website !== undefined && { website: company.website }),
                    ...(company.businessType && { business_type: company.businessType }),
                    ...(company.yearsInBusiness !== undefined && { years_in_business: company.yearsInBusiness }),
                    ...(company.annualRevenue !== undefined && { annual_revenue: company.annualRevenue }),
                    ...(company.numberOfEmployees !== undefined && { number_of_employees: company.numberOfEmployees }),
                    ...(company.description !== undefined && { description: company.description }),
                    ...(company.status && { status: company.status }),
                    ...(company.status && { approved: company.status === 'approved' }),
                    updated_at: new Date().toISOString()
                })
                .eq('id', companyId)
                .select(`
                    *,
                    contact_person:profiles!companies_contact_person_id_fkey(
                        full_name
                    )
                `)
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapDatabaseToModel(data);
            })
        );
    }

    private mapDatabaseToModel(dbCompany: any): Company {
        return {
            id: dbCompany.id,
            contactPersonId: dbCompany.contact_person_id,
            contactPersonName: dbCompany.contact_person?.full_name || `${dbCompany.first_name} ${dbCompany.last_name}`,
            companyName: dbCompany.company_name,
            taxNumber: dbCompany.tax_number,
            companyAddress: dbCompany.company_address,
            companyPhone: dbCompany.company_phone,
            companyEmail: dbCompany.company_email,
            website: dbCompany.website,
            businessType: dbCompany.business_type,
            yearsInBusiness: dbCompany.years_in_business,
            annualRevenue: dbCompany.annual_revenue,
            numberOfEmployees: dbCompany.number_of_employees,
            description: dbCompany.description,
            status: dbCompany.status,
            approved: dbCompany.approved,
            approvedAt: dbCompany.approved_at ? new Date(dbCompany.approved_at) : undefined,
            approvedBy: dbCompany.approved_by,
            rejectedAt: dbCompany.rejected_at ? new Date(dbCompany.rejected_at) : undefined,
            rejectedBy: dbCompany.rejected_by,
            rejectionReason: dbCompany.rejection_reason,
            createdAt: new Date(dbCompany.created_at),
            updatedAt: new Date(dbCompany.updated_at)
        };
    }
} 