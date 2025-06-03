// core/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, from, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
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
      switchMap((authUser: AuthUser | null) => {
        if (!authUser) return of(null);

        // Fetch user profile from database
        return this.fetchUserProfile(authUser.id);
      })
    );
  }

  private async fetchUserProfile(userId: string): Promise<User | null> {
    try {
      console.log('Fetching user profile for userId:', userId);

      // Get the Supabase client from the service
      const supabaseClient = (this.supabase as any).supabase;

      // Fetch profile data
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('Profile data fetched successfully:', profile);

      // Get auth user data for email
      const { data: { user: authUser } } = await supabaseClient.auth.getUser();

      // Map to simplified User model
      const user: User = {
        id: profile.user_id,
        email: authUser?.email || '',
        firstName: profile.first_name,
        lastName: profile.last_name,
        fullName: profile.full_name,
        avatar: profile.avatar_url,
        phone: profile.phone,
        dateOfBirth: profile.date_of_birth,
        gender: profile.gender,
        role: {
          id: profile.role,
          name: profile.role,
          permissions: [], // Simple role-based system doesn't need complex permissions
          isDefault: profile.role === 'customer',
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
          theme: 'light',
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
            profileVisibility: 'private',
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
            preferredContactTime: 'anytime'
          }
        },
        addresses: [],
        paymentMethods: [],
        socialLogins: [],
        emailVerified: !!authUser?.email_confirmed_at,
        phoneVerified: !!authUser?.phone_confirmed_at,
        twoFactorEnabled: false,
        lastLoginAt: authUser?.last_sign_in_at,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      };

      console.log('User model created successfully:', {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role.name
      });

      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);

      // If it's an RLS infinite recursion error, provide specific guidance
      if ((error as any)?.message?.includes('infinite recursion')) {
        console.error('INFINITE RECURSION DETECTED: Please run the RLS fix migration');
      }

      return null;
    }
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

  // Helper method to check if user is admin
  isAdmin(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user?.role?.name === 'admin' || false)
    );
  }

  // Helper method to check if user is company admin
  isCompanyAdmin(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user?.role?.name === 'company_admin' || false)
    );
  }

  // Helper method to check if user has admin privileges (admin or company_admin)
  hasAdminPrivileges(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user?.role?.name === 'admin' || user?.role?.name === 'company_admin' || false)
    );
  }
}