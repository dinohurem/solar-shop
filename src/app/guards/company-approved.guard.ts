import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CompanyApprovedGuard implements CanActivate {
    constructor(private supabase: SupabaseService, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.supabase.isAuthenticated().pipe(
            take(1),
            switchMap(isAuth => {
                if (!isAuth) {
                    return of(this.router.createUrlTree(['/login']));
                }
                return from(this.supabase.getSession()).pipe(
                    switchMap(session => {
                        const userId = session?.user?.id;
                        if (!userId) {
                            return of(this.router.createUrlTree(['/login']));
                        }
                        return from(
                            this.supabase.client
                                .from('companies')
                                .select('status')
                                .eq('contact_person_id', userId)
                                .single()
                        ).pipe(
                            map(({ data }) => {
                                if (data && data.status === 'approved') {
                                    return true;
                                }
                                return this.router.createUrlTree(['/partners/register']);
                            }),
                            catchError(() => of(this.router.createUrlTree(['/partners/register'])))
                        );
                    })
                );
            })
        );
    }
}
