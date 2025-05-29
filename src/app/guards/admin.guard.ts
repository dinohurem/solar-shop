import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take, switchMap, of } from 'rxjs';
import { selectCurrentUser, selectIsAuthenticated } from '../core/auth/store/auth.selectors';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    private store = inject(Store);
    private router = inject(Router);

    canActivate(): Observable<boolean> {
        return this.store.select(selectIsAuthenticated).pipe(
            take(1),
            switchMap(isAuthenticated => {
                if (!isAuthenticated) {
                    this.router.navigate(['/login']);
                    return of(false);
                }

                // Check if user has admin role
                return this.store.select(selectCurrentUser).pipe(
                    take(1),
                    map(user => {
                        const isAdmin = user?.role?.name === 'admin' || user?.role?.permissions?.some(p => p.resource === 'admin');

                        if (!isAdmin) {
                            this.router.navigate(['/']);
                            return false;
                        }

                        return true;
                    })
                );
            })
        );
    }
} 