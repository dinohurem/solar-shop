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
    auth => auth.user
);

export const selectUserProfile = createSelector(
    authSelector,
    (state) => state.user
);

export const selectIsAuthenticated = createSelector(
    authSelector,
    auth => !!auth.loggedIn
);

export const selectUserFullName = createSelector(
    selectCurrentUser,
    (user) => user ? `${user.firstName} ${user.lastName}` : null
);

export const selectUserAvatar = createSelector(
    authSelector,
    auth => auth.user?.avatar || null
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

// Simplified role-based selectors
export const selectUserRole = createSelector(
    selectCurrentUser,
    (user) => user?.role?.name || null
);

export const selectIsAdmin = createSelector(
    selectUserRole,
    (role) => role === 'admin'
);

export const selectIsCompanyAdmin = createSelector(
    selectUserRole,
    (role) => role === 'company_admin'
);

export const selectHasAdminPrivileges = createSelector(
    selectUserRole,
    (role) => role === 'admin' || role === 'company_admin'
);

export const selectAuthToken = createSelector(
    authSelector,
    auth => auth.token
);

// Company-related selectors
export const selectUserCompanyId = createSelector(
    selectCurrentUser,
    (user) => user?.companyId || null
);

export const selectIsPartner = createSelector(
    selectCurrentUser,
    (user) => !!user?.companyId && (user?.role?.name === 'company_admin' || user?.role?.name === 'admin')
);