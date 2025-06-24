import { createAction, props } from '@ngrx/store';
import { LoginRequest } from '../../../shared/models/auth.model';
import { User } from '../../../shared/models/user.model';

// Authentication Actions
export const login = createAction('[Auth] Login', props<{ loginRequest: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ token: string; user: User }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: any }>());
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

// Registration Actions
export const register = createAction('[Auth] Register', props<{ registerRequest: RegisterRequest }>());
export const registerSuccess = createAction('[Auth] Register Success', props<{ token: string; user: User }>());
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: any }>());

// Password Reset Actions
export const sendResetPasswordEmail = createAction(
    '[Auth] Request Reset Password',
    props<{ email: string }>()
);

export const sendResetPasswordEmailSuccess = createAction(
    '[Auth] Request Reset Password Success'
);

export const sendResetPasswordEmailFailure = createAction(
    '[Auth] Request Reset Password Failure',
    props<{ error: any }>()
);

export const resetPasswordRequest = createAction(
    '[Auth] Reset Password Request',
    props<{ email: string; token: string; newPassword: string, isNewUser: boolean }>()
);

export const resetPasswordSuccess = createAction(
    '[Auth] Reset Password Success'
);

export const resetPasswordFailure = createAction(
    '[Auth] Reset Password Failure',
    props<{ error: any }>()
);

// User Profile Actions
export const loadUserProfile = createAction('[Auth] Load User Profile');
export const loadUserProfileSuccess = createAction('[Auth] Load User Profile Success', props<{ user: User }>());
export const loadUserProfileFailure = createAction('[Auth] Load User Profile Failure', props<{ error: any }>());

export const updateUserProfile = createAction('[Auth] Update User Profile', props<{ user: Partial<User> }>());
export const updateUserProfileSuccess = createAction('[Auth] Update User Profile Success', props<{ user: User }>());
export const updateUserProfileFailure = createAction('[Auth] Update User Profile Failure', props<{ error: any }>());

// Token Management
export const checkAuthToken = createAction('[Auth] Check Auth Token');
export const initializeAuthState = createAction('[Auth] Initialize Auth State', props<{ token: string; user: User }>());
export const setAuthToken = createAction('[Auth] Set Auth Token', props<{ token: string }>());
export const clearAuthToken = createAction('[Auth] Clear Auth Token');

// Registration Request Interface
export interface RegisterRequest {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    password: string;
    confirmPassword: string;
}