import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, take, filter, switchMap } from 'rxjs';
import { selectIsAuthenticated, selectAuthLoading } from '../core/auth/store/auth.selectors';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private store: Store,
        private router: Router
    ) { }

    canActivate(): Observable<boolean | UrlTree> {
        // Wait for auth state to be initialized (not loading)
        return this.store.select(selectAuthLoading).pipe(
            filter(loading => !loading), // Wait until not loading
            take(1),
            switchMap(() => {
                return this.store.select(selectIsAuthenticated).pipe(
                    take(1),
                    map(isAuthenticated => {
                        if (isAuthenticated) {
                            return true;
                        }
                        return this.router.createUrlTree(['/login']);
                    })
                );
            })
        );
    }
} 