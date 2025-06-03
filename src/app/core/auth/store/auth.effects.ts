import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../shared/models/user.model';
import { AuthResponse, AuthUser } from '../../../shared/models/auth.model';

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private router: Router
    ) { }

    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            mergeMap(({ loginRequest }) =>
                this.authService.login(loginRequest).pipe(
                    map((response: AuthResponse) => {
                        if (response.error) {
                            throw new Error(response.error);
                        }

                        const accessToken = response.session?.access_token || '';

                        // Create a proper User object from the response
                        const user: User = this.createUserFromAuthResponse(response.user, loginRequest.email);

                        return AuthActions.loginSuccess({
                            token: accessToken,
                            user: user
                        });
                    }),
                    catchError(error => of(AuthActions.loginFailure({ error })))
                )
            )
        )
    );

    register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.register),
            mergeMap(({ registerRequest }) =>
                this.authService.register(registerRequest).pipe(
                    map((response: AuthResponse) => {
                        if (response.error) {
                            throw new Error(response.error);
                        }

                        const accessToken = response.session?.access_token || '';

                        // Create a proper User object from the response
                        const user: User = this.createUserFromRegisterResponse(response.user, registerRequest);

                        return AuthActions.registerSuccess({
                            token: accessToken,
                            user: user
                        });
                    }),
                    catchError(error => of(AuthActions.registerFailure({ error })))
                )
            )
        )
    );

    loginSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loginSuccess),
            tap(() => this.router.navigate(['/']))
        ),
        { dispatch: false }
    );

    registerSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.registerSuccess),
            tap(({ user }) => {
                // If user is not email verified, navigate to confirmation page
                if (user && !user.emailVerified) {
                    this.router.navigate(['/confirmation'], {
                        queryParams: { email: user.email }
                    });
                } else {
                    // User is automatically signed in and verified
                    this.router.navigate(['/']);
                }
            })
        ),
        { dispatch: false }
    );

    logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            mergeMap(() =>
                this.authService.logout().pipe(
                    tap(() => this.router.navigate(['/login'])),
                    map(() => AuthActions.logoutSuccess()),
                    catchError(() => {
                        // Even if logout fails, clear the state and redirect
                        this.router.navigate(['/login']);
                        return of(AuthActions.logoutSuccess());
                    })
                )
            )
        )
    );

    loadUserProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadUserProfile),
            mergeMap(() =>
                this.authService.getUserProfile().pipe(
                    map(user => AuthActions.loadUserProfileSuccess({ user })),
                    catchError(error => of(AuthActions.loadUserProfileFailure({ error })))
                )
            )
        )
    );

    updateUserProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.updateUserProfile),
            mergeMap(({ user }) =>
                this.authService.updateUserProfile(user).pipe(
                    map(updatedUser => AuthActions.updateUserProfileSuccess({ user: updatedUser })),
                    catchError(error => of(AuthActions.updateUserProfileFailure({ error })))
                )
            )
        )
    );

    checkAuthToken$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.checkAuthToken),
            mergeMap(() =>
                this.authService.getCurrentUser().pipe(
                    map(user => {
                        if (user) {
                            return AuthActions.loginSuccess({
                                token: 'supabase-managed', // Supabase manages tokens internally
                                user: user
                            });
                        } else {
                            return AuthActions.clearAuthToken();
                        }
                    }),
                    catchError(() => of(AuthActions.clearAuthToken()))
                )
            )
        )
    );

    forgotPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.sendResetPasswordEmail),
            switchMap(action =>
                this.authService.resetPassword(action.email).pipe(
                    map(() => AuthActions.sendResetPasswordEmailSuccess()),
                    catchError(error => of(AuthActions.sendResetPasswordEmailFailure({ error })))
                )
            )
        )
    );

    resetPassword$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPasswordRequest),
            mergeMap(action =>
                this.authService.updatePassword({
                    password: action.newPassword,
                    confirmPassword: action.newPassword
                }).pipe(
                    map(() => AuthActions.resetPasswordSuccess()),
                    catchError(error => of(AuthActions.resetPasswordFailure({ error })))
                )
            )
        )
    );

    resetPasswordSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.resetPasswordSuccess),
            tap(() => {
                this.router.navigate(['/login']);
            })
        ),
        { dispatch: false }
    );

    private createUserFromAuthResponse(authUser: AuthUser | null, email: string): User {
        if (!authUser) {
            return this.createDefaultUser();
        }

        return {
            id: authUser.id,
            email: email,
            firstName: authUser.user_metadata?.firstName || '',
            lastName: authUser.user_metadata?.lastName || '',
            fullName: `${authUser.user_metadata?.firstName || ''} ${authUser.user_metadata?.lastName || ''}`.trim(),
            avatar: authUser.user_metadata?.avatar_url,
            phone: authUser.user_metadata?.phone,
            role: {
                id: 'customer',
                name: 'customer',
                permissions: [],
                isDefault: true,
                isActive: true
            },
            status: {
                isActive: true,
                isBlocked: false,
                isSuspended: false
            },
            preferences: this.createDefaultPreferences(),
            addresses: [],
            paymentMethods: [],
            socialLogins: [],
            emailVerified: !!authUser.email_confirmed_at,
            phoneVerified: !!authUser.phone_confirmed_at,
            twoFactorEnabled: false,
            lastLoginAt: authUser.last_sign_in_at,
            createdAt: authUser.created_at,
            updatedAt: authUser.updated_at || authUser.created_at
        };
    }

    private createUserFromRegisterResponse(authUser: AuthUser | null, registerRequest: any): User {
        if (!authUser) {
            return this.createDefaultUser();
        }

        return {
            id: authUser.id,
            email: registerRequest.email,
            firstName: registerRequest.firstName || '',
            lastName: registerRequest.lastName || '',
            fullName: `${registerRequest.firstName || ''} ${registerRequest.lastName || ''}`.trim(),
            phone: registerRequest.phone,
            role: {
                id: 'customer',
                name: 'customer',
                permissions: [],
                isDefault: true,
                isActive: true
            },
            status: {
                isActive: true,
                isBlocked: false,
                isSuspended: false
            },
            preferences: this.createDefaultPreferences(),
            addresses: [],
            paymentMethods: [],
            socialLogins: [],
            emailVerified: !!authUser.email_confirmed_at,
            phoneVerified: !!authUser.phone_confirmed_at,
            twoFactorEnabled: false,
            lastLoginAt: authUser.last_sign_in_at,
            createdAt: authUser.created_at,
            updatedAt: authUser.updated_at || authUser.created_at
        };
    }

    private createDefaultUser(): User {
        return {
            id: '',
            email: '',
            firstName: '',
            lastName: '',
            fullName: '',
            role: {
                id: 'customer',
                name: 'customer',
                permissions: [],
                isDefault: true,
                isActive: true
            },
            status: {
                isActive: true,
                isBlocked: false,
                isSuspended: false
            },
            preferences: this.createDefaultPreferences(),
            addresses: [],
            paymentMethods: [],
            socialLogins: [],
            emailVerified: false,
            phoneVerified: false,
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    private createDefaultPreferences() {
        return {
            language: 'en',
            timezone: 'UTC',
            currency: 'EUR',
            theme: 'light' as const,
            notifications: {
                email: {
                    orderUpdates: true,
                    promotions: true,
                    newsletter: true,
                    security: true,
                    productUpdates: true
                },
                sms: {
                    orderUpdates: true,
                    security: true,
                    promotions: false
                },
                push: {
                    orderUpdates: true,
                    promotions: false,
                    reminders: true
                }
            },
            privacy: {
                profileVisibility: 'private' as const,
                showEmail: false,
                showPhone: false,
                allowDataCollection: true,
                allowPersonalization: true,
                allowThirdPartySharing: false
            },
            marketing: {
                allowEmailMarketing: true,
                allowSmsMarketing: false,
                allowPushMarketing: true,
                interests: [],
                preferredContactTime: 'anytime' as const
            }
        };
    }
}
