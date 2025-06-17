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
            full_name,
            email
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
              full_name,
              email
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
              full_name,
              email
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