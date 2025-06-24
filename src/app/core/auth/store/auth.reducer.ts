import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
    initialAuthState,

    // Login Actions
    on(AuthActions.login, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthActions.loginSuccess, (state, { token, user }) => ({
        ...state,
        loading: false,
        loggedIn: true,
        token,
        user,
        error: null
    })),

    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        loading: false,
        loggedIn: false,
        token: null,
        user: null,
        error
    })),

    // Registration Actions
    on(AuthActions.register, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthActions.registerSuccess, (state, { token, user }) => ({
        ...state,
        loading: false,
        loggedIn: true,
        token,
        user,
        error: null
    })),

    on(AuthActions.registerFailure, (state, { error }) => ({
        ...state,
        loading: false,
        loggedIn: false,
        token: null,
        user: null,
        error
    })),

    // Logout Actions
    on(AuthActions.logout, (state) => ({
        ...state,
        loading: true
    })),

    on(AuthActions.logoutSuccess, (state) => ({
        ...initialAuthState
    })),

    // Password Reset Actions
    on(AuthActions.sendResetPasswordEmail, (state) => ({
        ...state,
        loading: true,
        error: null,
        passwordResetSuccessMessage: null
    })),

    on(AuthActions.sendResetPasswordEmailSuccess, (state) => ({
        ...state,
        loading: false,
        passwordResetSuccessMessage: 'Password reset email sent successfully'
    })),

    on(AuthActions.sendResetPasswordEmailFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(AuthActions.resetPasswordRequest, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthActions.resetPasswordSuccess, (state) => ({
        ...state,
        loading: false,
        passwordResetSuccessMessage: 'Password reset successfully'
    })),

    on(AuthActions.resetPasswordFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // User Profile Actions
    on(AuthActions.loadUserProfile, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthActions.loadUserProfileSuccess, (state, { user }) => ({
        ...state,
        loading: false,
        user,
        error: null
    })),

    on(AuthActions.loadUserProfileFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    on(AuthActions.updateUserProfile, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthActions.updateUserProfileSuccess, (state, { user }) => ({
        ...state,
        loading: false,
        user,
        error: null
    })),

    on(AuthActions.updateUserProfileFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Token Management Actions
    on(AuthActions.checkAuthToken, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(AuthActions.initializeAuthState, (state, { token, user }) => ({
        ...state,
        token,
        user,
        loggedIn: true,
        loading: false,
        error: null
    })),

    on(AuthActions.setAuthToken, (state, { token }) => ({
        ...state,
        token,
        loggedIn: !!token
    })),

    on(AuthActions.clearAuthToken, (state) => ({
        ...state,
        token: null,
        loggedIn: false,
        user: null,
        loading: false
    }))
);
