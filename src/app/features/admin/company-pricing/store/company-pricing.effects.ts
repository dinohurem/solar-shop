import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import * as CompanyPricingActions from './company-pricing.actions';

@Injectable()
export class CompanyPricingEffects {
    constructor(
        private actions$: Actions,
        private supabaseService: SupabaseService
    ) { }

    loadCompanies$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyPricingActions.loadCompanies),
            switchMap(() => {
                console.log('CompanyPricingEffects: loadCompanies effect triggered');
                return this.supabaseService.client
                    .from('companies')
                    .select('*')
                    .eq('status', 'approved')
                    .then(({ data, error }) => {
                        console.log('CompanyPricingEffects: Supabase query result:', { data, error });
                        if (error) {
                            throw new Error(error.message);
                        }

                        const companies = (data || [])
                            .map((company: any) => ({
                                id: company.id,
                                name: company.companyName || company.company_name || 'Unknown Company',
                                email: company.companyEmail || company.company_email || company.email || 'No email'
                            }));

                        console.log('CompanyPricingEffects: Mapped companies:', companies);
                        return CompanyPricingActions.loadCompaniesSuccess({ companies });
                    })
            }),
            catchError(error => {
                console.error('CompanyPricingEffects: Error loading companies:', error);
                return of(CompanyPricingActions.loadCompaniesFailure({ error: error.message }));
            })
        )
    );

    loadProducts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyPricingActions.loadProducts),
            switchMap(() =>
                this.supabaseService.getTable('products')
                    .then(data => {
                        const products = (data || [])
                            .filter((p: any) => p.is_active !== false)
                            .map((product: any) => ({
                                id: product.id,
                                name: product.name,
                                sku: product.sku,
                                price: product.price
                            }));
                        return CompanyPricingActions.loadProductsSuccess({ products });
                    })
                    .catch(error => CompanyPricingActions.loadProductsFailure({ error: error.message }))
            ),
            catchError(error => of(CompanyPricingActions.loadProductsFailure({ error: error.message })))
        )
    );

    loadCompanyPricing$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyPricingActions.loadCompanyPricing),
            switchMap(() =>
                this.supabaseService.getTable('company_pricing')
                    .then(data => {
                        const companyPricing = data || [];
                        return CompanyPricingActions.loadCompanyPricingSuccess({ companyPricing });
                    })
                    .catch(error => CompanyPricingActions.loadCompanyPricingFailure({ error: error.message }))
            ),
            catchError(error => of(CompanyPricingActions.loadCompanyPricingFailure({ error: error.message })))
        )
    );

    createCompanyPricing$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyPricingActions.createCompanyPricing),
            switchMap(action => {
                return this.supabaseService.createRecord('company_pricing', action.pricing)
                    .then(data => {
                        if (!data) {
                            throw new Error('No data returned from create operation');
                        }
                        return CompanyPricingActions.createCompanyPricingSuccess({ pricing: data as CompanyPricingActions.CompanyPricing });
                    });
            }),
            catchError(error => of(CompanyPricingActions.createCompanyPricingFailure({ error: error.message })))
        )
    );

    updateCompanyPricing$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyPricingActions.updateCompanyPricing),
            switchMap(action => {
                return this.supabaseService.updateRecord('company_pricing', action.id, action.pricing)
                    .then(data => {
                        if (!data) {
                            throw new Error('No data returned from update operation');
                        }
                        return CompanyPricingActions.updateCompanyPricingSuccess({ pricing: data as CompanyPricingActions.CompanyPricing });
                    });
            }),
            catchError(error => of(CompanyPricingActions.updateCompanyPricingFailure({ error: error.message })))
        )
    );

    deleteCompanyPricing$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompanyPricingActions.deleteCompanyPricing),
            switchMap(action => {
                return this.supabaseService.deleteRecord('company_pricing', action.id)
                    .then(() => {
                        return CompanyPricingActions.deleteCompanyPricingSuccess({ id: action.id });
                    })
                    .catch(error => CompanyPricingActions.deleteCompanyPricingFailure({ error: error.message }));
            }),
            catchError(error => of(CompanyPricingActions.deleteCompanyPricingFailure({ error: error.message })))
        )
    );
} 