import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { CompaniesService } from '../services/companies.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { EmailService } from '../../../../services/email.service';
import * as CompaniesActions from './companies.actions';

@Injectable()
export class CompaniesEffects {
    private actions$ = inject(Actions);
    private companiesService = inject(CompaniesService);
    private toastService = inject(ToastService);
    private emailService = inject(EmailService);
    private store = inject(Store);

    loadCompanies$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompaniesActions.loadCompanies),
            mergeMap(() =>
                this.companiesService.getCompanies().pipe(
                    map(companies => CompaniesActions.loadCompaniesSuccess({ companies })),
                    catchError(error => {
                        this.toastService.showError('Failed to load companies');
                        return of(CompaniesActions.loadCompaniesFailure({ error: error.message }));
                    })
                )
            )
        )
    );

    approveCompany$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompaniesActions.approveCompany),
            mergeMap(action =>
                this.companiesService.approveCompany(action.companyId).pipe(
                    switchMap(company => {
                        // Send approval email
                        return from(this.emailService.sendCompanyApprovalEmail({
                            to: company.companyEmail,
                            companyName: company.companyName,
                            companyEmail: company.companyEmail
                        })).pipe(
                            map(() => {
                                this.toastService.showSuccess('Company approved successfully and notification email sent');
                                return CompaniesActions.approveCompanySuccess({ company });
                            }),
                            catchError(emailError => {
                                console.error('Failed to send approval email:', emailError);
                                this.toastService.showSuccess('Company approved successfully');
                                return of(CompaniesActions.approveCompanySuccess({ company }));
                            })
                        );
                    }),
                    catchError(error => {
                        this.toastService.showError('Failed to approve company');
                        return of(CompaniesActions.approveCompanyFailure({ error: error.message }));
                    })
                )
            )
        )
    );

    rejectCompany$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompaniesActions.rejectCompany),
            mergeMap(action =>
                this.companiesService.rejectCompany(action.companyId, action.reason).pipe(
                    map(company => {
                        this.toastService.showSuccess('Company rejected successfully');
                        return CompaniesActions.rejectCompanySuccess({ company });
                    }),
                    catchError(error => {
                        this.toastService.showError('Failed to reject company');
                        return of(CompaniesActions.rejectCompanyFailure({ error: error.message }));
                    })
                )
            )
        )
    );

    deleteCompany$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompaniesActions.deleteCompany),
            mergeMap(action =>
                this.companiesService.deleteCompany(action.companyId).pipe(
                    map(() => {
                        this.toastService.showSuccess('Company deleted successfully');
                        return CompaniesActions.deleteCompanySuccess({ companyId: action.companyId });
                    }),
                    catchError(error => {
                        this.toastService.showError('Failed to delete company');
                        return of(CompaniesActions.deleteCompanyFailure({ error: error.message }));
                    })
                )
            )
        )
    );

    createCompany$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompaniesActions.createCompany),
            mergeMap(action =>
                this.companiesService.createCompany(action.company).pipe(
                    map(company => {
                        this.toastService.showSuccess('Company created successfully');
                        return CompaniesActions.createCompanySuccess({ company });
                    }),
                    catchError(error => {
                        this.toastService.showError('Failed to create company');
                        return of(CompaniesActions.createCompanyFailure({ error: error.message }));
                    })
                )
            )
        )
    );

    updateCompany$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CompaniesActions.updateCompany),
            mergeMap(action =>
                this.companiesService.updateCompany(action.companyId, action.company).pipe(
                    map(company => {
                        this.toastService.showSuccess('Company updated successfully');
                        return CompaniesActions.updateCompanySuccess({ company });
                    }),
                    catchError(error => {
                        this.toastService.showError('Failed to update company');
                        return of(CompaniesActions.updateCompanyFailure({ error: error.message }));
                    })
                )
            )
        )
    );
} 