import { createReducer, on } from '@ngrx/store';
import { OffersActions } from './offers.actions';
import { OffersState, initialOffersState } from './offers.state';

export const offersReducer = createReducer(
    initialOffersState,
    on(OffersActions.loadOffers, (state) => ({
        ...state,
        isLoading: true,
        error: null
    })),
    on(OffersActions.loadOffersSuccess, (state, { offers }) => ({
        ...state,
        offers,
        isLoading: false,
        error: null
    })),
    on(OffersActions.loadOffersFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    }))
); 