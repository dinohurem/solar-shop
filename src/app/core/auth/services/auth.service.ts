// core/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { SupabaseService } from '../../../services/supabase.service';
import { LoginRequest, AuthResponse, AuthUser, AuthSession, ResetPasswordRequest, UpdatePasswordRequest } from '../../../shared/models/auth.model';
import { RegisterRequest as SupabaseRegisterRequest } from '../../../shared/models/auth.model';
import { RegisterRequest } from '../store/auth.actions';
import { User } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private supabase: SupabaseService) { }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return from(this.supabase.signIn(loginRequest));
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    // Convert the RegisterRequest from actions to the format expected by SupabaseService
    const supabaseRegisterRequest: SupabaseRegisterRequest = {
      email: registerRequest.email,
      password: registerRequest.password,
      firstName: registerRequest.firstName,
      lastName: registerRequest.lastName,
      phone: registerRequest.phone || undefined
    };

    return from(this.supabase.signUp(supabaseRegisterRequest));
  }

  logout(): Observable<{ error?: string }> {
    return from(this.supabase.signOut());
  }

  getCurrentUser(): Observable<User | null> {
    return this.supabase.getCurrentUser().pipe(
      map((authUser: AuthUser | null) => {
        if (!authUser) return null;

        return {
          id: authUser.id,
          email: authUser.email,
          firstName: authUser.user_metadata?.firstName || '',
          lastName: authUser.user_metadata?.lastName || '',
          fullName: authUser.user_metadata?.fullName || `${authUser.user_metadata?.firstName || ''} ${authUser.user_metadata?.lastName || ''}`.trim(),
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
          preferences: {
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
          },
          addresses: [],
          paymentMethods: [],
          socialLogins: [],
          emailVerified: !!authUser.email_confirmed_at,
          phoneVerified: !!authUser.phone_confirmed_at,
          twoFactorEnabled: false,
          createdAt: authUser.created_at,
          updatedAt: authUser.updated_at
        };
      })
    );
  }

  getUserProfile(): Observable<User> {
    return this.getCurrentUser().pipe(
      map(user => {
        if (!user) {
          throw new Error('No authenticated user found');
        }
        return user;
      })
    );
  }

  refreshToken(): Observable<AuthSession | null> {
    return from(this.supabase.getSession());
  }

  resetPassword(email: string): Observable<{ error?: string }> {
    return from(this.supabase.resetPassword({ email }));
  }

  updatePassword(request: UpdatePasswordRequest): Observable<{ error?: string }> {
    return from(this.supabase.updatePassword(request.password));
  }

  validateToken(token: string): Observable<boolean> {
    // Simple validation - check if we have a current session
    return this.supabase.isAuthenticated();
  }

  requestResetPassword(email: string): Observable<void> {
    return from(this.supabase.resetPassword({ email }).then(() => undefined));
  }

  updateUserProfile(user: Partial<User>): Observable<User> {
    // Mock implementation - in real app, this would update in backend
    return this.getUserProfile();
  }
}