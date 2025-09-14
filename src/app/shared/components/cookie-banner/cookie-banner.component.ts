import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div *ngIf="showBanner" class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex-1">
            <p class="text-sm text-gray-700 font-['DM_Sans']">
              {{ 'cookieBanner.message' | translate }}
              <a href="/kolacici" class="text-solar-600 hover:text-solar-700 underline ml-1">
                {{ 'cookieBanner.learnMore' | translate }}
              </a>
            </p>
          </div>
          <div class="flex gap-3">
            <button
              (click)="rejectCookies()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-['DM_Sans']"
            >
              {{ 'cookieBanner.reject' | translate }}
            </button>
            <button
              (click)="acceptCookies()"
              class="px-4 py-2 text-sm font-medium text-white bg-solar-600 hover:bg-solar-700 rounded-lg transition-colors font-['DM_Sans']"
            >
              {{ 'cookieBanner.accept' | translate }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CookieBannerComponent implements OnInit {
  showBanner = false;
  private readonly COOKIE_CONSENT_KEY = 'cookie-consent';
  private readonly COOKIE_CONSENT_ACCEPTED = 'accepted';
  private readonly COOKIE_CONSENT_REJECTED = 'rejected';

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.checkCookieConsent();
  }

  private checkCookieConsent(): void {
    const consent = localStorage.getItem(this.COOKIE_CONSENT_KEY);
    
    // Show banner only if user hasn't made a choice yet
    if (!consent) {
      this.showBanner = true;
    }
  }

  acceptCookies(): void {
    localStorage.setItem(this.COOKIE_CONSENT_KEY, this.COOKIE_CONSENT_ACCEPTED);
    this.showBanner = false;
    
    // Enable analytics or other cookie-based features here
    this.enableCookies();
  }

  rejectCookies(): void {
    localStorage.setItem(this.COOKIE_CONSENT_KEY, this.COOKIE_CONSENT_REJECTED);
    this.showBanner = false;
    
    // Disable analytics or other cookie-based features here
    this.disableCookies();
  }

  private enableCookies(): void {
    // Enable Google Analytics, Facebook Pixel, etc.
    // This is where you would initialize your tracking scripts
    console.log('Cookies accepted - enabling tracking');
    
    // Example: Initialize Google Analytics
    // if (typeof gtag !== 'undefined') {
    //   gtag('consent', 'update', {
    //     'analytics_storage': 'granted',
    //     'ad_storage': 'granted'
    //   });
    // }
  }

  private disableCookies(): void {
    // Disable tracking scripts
    console.log('Cookies rejected - disabling tracking');
    
    // Example: Disable Google Analytics
    // if (typeof gtag !== 'undefined') {
    //   gtag('consent', 'update', {
    //     'analytics_storage': 'denied',
    //     'ad_storage': 'denied'
    //   });
    // }
  }

  // Public method to check if cookies are accepted
  static areCookiesAccepted(): boolean {
    return localStorage.getItem('cookie-consent') === 'accepted';
  }
}