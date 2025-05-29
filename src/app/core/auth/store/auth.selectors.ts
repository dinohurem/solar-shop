import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

const authSelector = createFeatureSelector<AuthState>('auth');

export const getLoggedIn = createSelector(
    authSelector,
    auth => !!auth.loggedIn
);

export const getToken = createSelector(
    authSelector,
    auth => auth.token
);

export const selectAuthLoading = createSelector(
    authSelector,
    (state) => state.loading
);

export const selectAuthError = createSelector(
    authSelector,
    (state) => state.error
);

export const selectPasswordResetSuccessMessage = createSelector(
    authSelector,
    (state) => state.passwordResetSuccessMessage
);

// User Selectors
export const selectCurrentUser = createSelector(
    authSelector,
    (state) => state.user
);

export const selectUserProfile = createSelector(
    authSelector,
    (state) => state.user
);

export const selectIsAuthenticated = createSelector(
    authSelector,
    (state) => !!state.loggedIn && !!state.token
);

export const selectUserFullName = createSelector(
    selectCurrentUser,
    (user) => user ? `${user.firstName} ${user.lastName}` : null
);

export const selectUserAvatar = createSelector(
    selectCurrentUser,
    (user) => user?.avatar || null
);

export const selectUserEmail = createSelector(
    selectCurrentUser,
    (user) => user?.email || null
);

export const selectUserAddresses = createSelector(
    selectCurrentUser,
    (user) => user?.addresses || []
);

export const selectUserPaymentMethods = createSelector(
    selectCurrentUser,
    (user) => user?.paymentMethods || []
);

export const selectUserPreferences = createSelector(
    selectCurrentUser,
    (user) => user?.preferences || null
);

export const selectIsAdmin = createSelector(
    selectCurrentUser,
    (user) => {
        if (!user || !user.role) return false;
        return user.role.name === 'admin' ||
            user.role.permissions?.some(p => p.resource === 'admin') || false;
    }
);