import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CompanyApprovedGuard implements CanActivate {
    constructor(private supabase: SupabaseService, private router: Router) { }

    canActivate(): Observable<boolean | UrlTree> {
        // First check if we have a stored session, then wait for auth state
        return from(this.supabase.getSession()).pipe(
            switchMap(session => {
                if (session?.user) {
                    // User is authenticated, check company status
                    return from(
                        this.supabase.client
                            .from('companies')
                            .select('status')
                            .eq('contact_person_id', session.user.id)
                            .single()
                    ).pipe(
                        map(({ data, error }) => {
                            if (error) {
                                // No company found, redirect to register
                                return this.router.createUrlTree(['/partneri/registracija']);
                            }

                            if (data && data.status === 'approved') {
                                return true;
                            }

                            // Company exists but not approved
                            return this.router.createUrlTree(['/partneri/registracija']);
                        }),
                        catchError(() => of(this.router.createUrlTree(['/partneri/registracija'])))
                    );
                } else {
                    // No session, redirect to login
                    return of(this.router.createUrlTree(['/prijava']));
                }
            }),
            catchError(() => {
                // Error getting session, redirect to login
                return of(this.router.createUrlTree(['/prijava']));
            })
        );
    }
}
