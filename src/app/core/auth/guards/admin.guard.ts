import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectHasAdminPrivileges, selectIsAuthenticated } from '../store/auth.selectors';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {

    constructor(
        private store: Store,
        private router: Router
    ) { }

    canActivate(): Observable<boolean> {
        return this.store.select(selectIsAuthenticated).pipe(
            take(1),
            switchMap(isAuthenticated => {
                if (!isAuthenticated) {
                    // Redirect to login if not authenticated
                    this.router.navigate(['/login']);
                    return of(false);
                }

                // Check if user has admin privileges
                return this.store.select(selectHasAdminPrivileges).pipe(
                    take(1),
                    map(hasAdminPrivileges => {
                        if (!hasAdminPrivileges) {
                            // Redirect to home if not admin
                            this.router.navigate(['/']);
                            return false;
                        }
                        return true;
                    }),
                    catchError(() => {
                        this.router.navigate(['/']);
                        return of(false);
                    })
                );
            }),
            catchError(() => {
                this.router.navigate(['/login']);
                return of(false);
            })
        );
    }
} 