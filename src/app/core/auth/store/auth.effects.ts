import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import { AuthService } from '../services/auth.service';
import { CookieService } from '../services/cookie.service';
import { Router } from '@angular/router';
import { User } from '../../../shared/models/user.model';
import { AuthResponse, AuthUser } from '../../../shared/models/auth.model';

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private cookieService: CookieService,
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
                        this.cookieService.setCookie('accessToken', accessToken);

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
                        this.cookieService.setCookie('accessToken', accessToken);

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
            tap(() => {
                this.cookieService.clear('accessToken');
                this.router.navigate(['/login']);
            }),
            map(() => AuthActions.logoutSuccess())
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
            mergeMap(() => {
                const token = this.cookieService.getCookie('accessToken');
                if (token) {
                    return this.authService.validateToken(token).pipe(
                        map((isValid: boolean) => {
                            if (isValid) {
                                // Get current user if token is valid
                                return this.authService.getCurrentUser().pipe(
                                    map(user => {
                                        if (user) {
                                            return AuthActions.loginSuccess({
                                                token,
                                                user: user
                                            });
                                        } else {
                                            this.cookieService.clear('accessToken');
                                            return AuthActions.clearAuthToken();
                                        }
                                    }),
                                    catchError(() => {
                                        this.cookieService.clear('accessToken');
                                        return of(AuthActions.clearAuthToken());
                                    })
                                );
                            } else {
                                this.cookieService.clear('accessToken');
                                return of(AuthActions.clearAuthToken());
                            }
                        }),
                        mergeMap(action => action), // Flatten the nested observable
                        catchError(() => {
                            this.cookieService.clear('accessToken');
                            return of(AuthActions.clearAuthToken());
                        })
                    );
                } else {
                    return of(AuthActions.clearAuthToken());
                }
            })
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
            tap(() => setTimeout(() => {
                this.router.navigate(['/login']);
            }, 3000))
        ),
        { dispatch: false }
    );

    private createUserFromAuthResponse(authUser: AuthUser | null, email: string): User {
        if (!authUser) {
            return this.createDefaultUser();
        }

        return {
            id: authUser.id,
            email: authUser.email || email,
            firstName: authUser.user_metadata?.firstName || 'User',
            lastName: authUser.user_metadata?.lastName || '',
            fullName: authUser.user_metadata?.fullName || `${authUser.user_metadata?.firstName || 'User'} ${authUser.user_metadata?.lastName || ''}`.trim(),
            role: {
                id: '1',
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
            createdAt: authUser.created_at,
            updatedAt: authUser.updated_at
        };
    }

    private createUserFromRegisterResponse(authUser: AuthUser | null, registerRequest: any): User {
        if (!authUser) {
            return this.createDefaultUser();
        }

        return {
            id: authUser.id,
            email: authUser.email,
            firstName: authUser.user_metadata?.firstName || registerRequest.firstName || 'User',
            lastName: authUser.user_metadata?.lastName || registerRequest.lastName || '',
            fullName: authUser.user_metadata?.fullName || `${registerRequest.firstName || 'User'} ${registerRequest.lastName || ''}`.trim(),
            phone: authUser.user_metadata?.phone || registerRequest.phone,
            role: {
                id: '1',
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
            createdAt: authUser.created_at,
            updatedAt: authUser.updated_at
        };
    }

    private createDefaultUser(): User {
        return {
            id: 'default',
            email: 'user@example.com',
            firstName: 'User',
            lastName: '',
            fullName: 'User',
            role: {
                id: '1',
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
            theme: 'light' as 'light' | 'dark' | 'auto',
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
                profileVisibility: 'private' as 'private' | 'public' | 'friends',
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
                preferredContactTime: 'anytime' as 'anytime' | 'morning' | 'afternoon' | 'evening'
            }
        };
    }
}
