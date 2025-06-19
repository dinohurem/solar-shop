import { createReducer, on } from '@ngrx/store';
import { FooterActions } from './footer.actions';
import { FooterState, initialFooterState } from './footer.state';

export const footerReducer = createReducer(
    initialFooterState,
    on(FooterActions.loadFooterData, (state) => ({
        ...state,
        error: null,
    })),
    on(FooterActions.loadFooterDataSuccess, (state, { data }) => ({
        ...state,
        data,
        error: null,
    })),
    on(FooterActions.loadFooterDataFailure, (state, { error }) => ({
        ...state,
        error,
    })),
    on(FooterActions.subscribeNewsletter, (state) => ({
        ...state,
        newsletterSubscriptionStatus: 'loading' as const,
        newsletterMessage: null,
    })),
    on(FooterActions.subscribeNewsletterSuccess, (state, { message }) => ({
        ...state,
        newsletterSubscriptionStatus: 'success' as const,
        newsletterMessage: message,
    })),
    on(FooterActions.subscribeNewsletterFailure, (state, { error }) => ({
        ...state,
        newsletterSubscriptionStatus: 'error' as const,
        newsletterMessage: error,
    })),
    on(FooterActions.resetNewsletterState, (state) => ({
        ...state,
        newsletterSubscriptionStatus: 'idle' as const,
        newsletterMessage: null,
    }))
); 