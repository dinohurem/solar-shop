import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FooterState } from './footer.state';

export const selectFooterState = createFeatureSelector<FooterState>('footer');

export const selectFooterData = createSelector(
    selectFooterState,
    (state: FooterState) => state.data
);

export const selectError = createSelector(
    selectFooterState,
    (state: FooterState) => state.error
);

export const selectNewsletterSubscriptionStatus = createSelector(
    selectFooterState,
    (state: FooterState) => state.newsletterSubscriptionStatus
);

export const selectNewsletterMessage = createSelector(
    selectFooterState,
    (state: FooterState) => state.newsletterMessage
);

export const selectNewsletterState = createSelector(
    selectNewsletterSubscriptionStatus,
    selectNewsletterMessage,
    (status, message) => ({
        loading: status === 'loading',
        success: status === 'success',
        error: status === 'error' ? message : null
    })
); 