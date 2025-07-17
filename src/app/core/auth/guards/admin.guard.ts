import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, take, filter, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectHasAdminPrivileges, selectIsAuthenticated, selectAuthLoading } from '../store/auth.selectors';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {

    constructor(
        private store: Store,
        private router: Router
    ) { }

    canActivate(): Observable<boolean> {
        // Wait for auth state to be initialized (not loading)
        return this.store.select(selectAuthLoading).pipe(
            filter(loading => !loading), // Wait until not loading
            take(1),
            switchMap(() => {
                // Now check authentication and admin privileges
                return combineLatest([
                    this.store.select(selectIsAuthenticated),
                    this.store.select(selectHasAdminPrivileges)
                ]).pipe(
                    take(1),
                    map(([isAuthenticated, hasAdminPrivileges]) => {
                        if (!isAuthenticated) {
                            // Redirect to login if not authenticated
                            this.router.navigate(['/prijava']);
                            return false;
                        }

                        if (!hasAdminPrivileges) {
                            // Redirect to home if not admin
                            this.router.navigate(['/']);
                            return false;
                        }

                        return true;
                    }),
                    catchError(() => {
                        this.router.navigate(['/prijava']);
                        return of(false);
                    })
                );
            }),
            catchError(() => {
                this.router.navigate(['/prijava']);
                return of(false);
            })
        );
    }
} 