import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { SupabaseService } from '../../../../services/supabase.service';
import { User } from '../../../../shared/models/user.model';
import { TranslationService } from '../../../../shared/services/translation.service';
import * as AuthActions from '../../store/auth.actions';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-solar-500 border-t-transparent mx-auto mb-4"></div>
        <p class="text-gray-600">{{ message }}</p>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private supabaseService = inject(SupabaseService);
  private translationService = inject(TranslationService);

  message = '';

  async ngOnInit() {
    this.message = this.translationService.translate('verifyingEmail');

    try {
      // Get the current session (Supabase will handle the token verification from URL)
      const { data: { session }, error } = await this.supabaseService.client.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        this.message = this.translationService.translate('emailVerificationFailed');
        setTimeout(() => {
          this.router.navigate(['/prijava']);
        }, 2000);
        return;
      }

      if (session) {
        // Successful verification - dispatch login success action
        const user = session.user;

        // Get user profile and create complete User object
        try {
          const { data: profile } = await this.supabaseService.client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          const userData = this.createUserFromProfile(user, profile);

          // Dispatch login success with token
          this.store.dispatch(AuthActions.loginSuccess({
            token: session.access_token,
            user: userData
          }));
        } catch (error) {
          // Fallback if profile fetch fails
          const userData = this.createUserFromAuthUser(user);
          this.store.dispatch(AuthActions.loginSuccess({
            token: session.access_token,
            user: userData
          }));
        }

        // Show success message
        this.message = this.translationService.translate('emailVerifiedSuccess') + ' ' + this.translationService.translate('redirecting');

        // Show success toast
        this.showSuccessToast(this.translationService.translate('emailVerifiedSuccess'));

        // Redirect to home or intended page
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      } else {
        // No session - might be an old or invalid link
        this.message = this.translationService.translate('invalidVerificationLink');
        setTimeout(() => {
          this.router.navigate(['/prijava']);
        }, 2000);
      }
    } catch (error) {
      console.error('Error during auth callback:', error);
      this.message = this.translationService.translate('verificationError');
      setTimeout(() => {
        this.router.navigate(['/prijava']);
      }, 2000);
    }
  }

  private showSuccessToast(message: string) {
    // Create and show a simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('animate-slide-out-right');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  private createUserFromProfile(authUser: any, profile: any): User {
    const role = profile?.role || 'customer';
    return {
      id: authUser.id,
      email: authUser.email || '',
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      fullName: profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
      avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      phone: profile?.phone || authUser.user_metadata?.phone,
      role: {
        id: role,
        name: role,
        permissions: [],
        isDefault: role === 'customer',
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
    } as User;
  }

  private createUserFromAuthUser(authUser: any): User {
    return {
      id: authUser.id,
      email: authUser.email || '',
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
    } as User;
  }

  private createDefaultPreferences() {
    return {
      language: 'hr',
      timezone: 'Europe/Zagreb',
      currency: 'EUR',
      theme: 'light' as const,
      notifications: {
        email: {
          orderUpdates: true,
          promotions: false,
          newsletter: false,
          security: true,
          productUpdates: false
        },
        sms: {
          orderUpdates: false,
          security: false,
          promotions: false
        },
        push: {
          orderUpdates: false,
          promotions: false,
          reminders: false
        }
      },
      privacy: {
        profileVisibility: 'private' as const,
        showEmail: false,
        showPhone: false,
        allowDataCollection: false,
        allowPersonalization: false,
        allowThirdPartySharing: false
      },
      marketing: {
        allowEmailMarketing: false,
        allowSmsMarketing: false,
        allowPushMarketing: false,
        interests: [],
        preferredContactTime: 'anytime' as const
      }
    };
  }
}