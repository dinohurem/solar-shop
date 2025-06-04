import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { OffersActions } from './offers.actions';
import { OffersService } from '../services/offers.service';

@Injectable()
export class OffersEffects {
    private actions$ = inject(Actions);
    private offersService = inject(OffersService);

    loadOffers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OffersActions.loadOffers),
            mergeMap(() =>
                this.offersService.getOffers().pipe(
                    map(offers => OffersActions.loadOffersSuccess({ offers })),
                    catchError(error =>
                        of(OffersActions.loadOffersFailure({ error: error.message || 'Failed to load offers' }))
                    )
                )
            )
        )
    );
} 