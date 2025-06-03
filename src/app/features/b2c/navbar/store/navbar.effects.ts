import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { tap, switchMap, delay, take } from 'rxjs/operators';
import { of } from 'rxjs';
import { NavbarActions } from './navbar.actions';
import { selectCurrentLanguage } from './navbar.selectors';
import { TranslationService } from '../../../../shared/services/translation.service';

@Injectable()
export class NavbarEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private translationService = inject(TranslationService);

    // Initialize navbar and sync with translation service
    initializeNavbar$ = createEffect(() =>
        this.actions$.pipe(
            ofType(NavbarActions.initializeNavbar),
            switchMap(() =>
                this.store.select(selectCurrentLanguage).pipe(
                    take(1),
                    tap(currentLanguage => {
                        this.translationService.setLanguage(currentLanguage as 'hr' | 'en');
                    })
                )
            )
        ), { dispatch: false }
    );

    // Handle language toggle
    toggleLanguage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(NavbarActions.toggleLanguage),
            // Add a small delay to ensure the reducer has updated the state
            delay(0),
            switchMap(() =>
                this.store.select(selectCurrentLanguage).pipe(
                    take(1),
                    tap(currentLanguage => {
                        this.translationService.setLanguage(currentLanguage as 'hr' | 'en');
                    })
                )
            )
        ), { dispatch: false }
    );
} 