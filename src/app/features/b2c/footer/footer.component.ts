import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FooterActions } from './store/footer.actions';
import { selectFooterData } from './store/footer.selectors';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

export interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface FooterData {
  sections: FooterSection[];
  socialLinks: SocialLink[];
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
  newsletter: {
    title: string;
    description: string;
  };
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- Footer -->
    <footer class="bg-heyhome-dark-green text-white">
      <!-- Main Footer Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          <!-- Company Info -->
          <div class="lg:col-span-1">
            <div class="mb-6">
              <img src="/assets/images/logo.png" alt="SolarShop" class="h-10 w-auto mb-4">
              <p class="text-gray-300 leading-relaxed font-['DM_Sans']">
                {{ 'footer.companyDescription' | translate }}
              </p>
            </div>
            
            <!-- Contact Info -->
            <div *ngIf="footerData$ | async as footer" class="space-y-3">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#0ACF83] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.address' | translate }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#0ACF83] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.phone' | translate }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#0ACF83] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.email' | translate }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#0ACF83] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.hours' | translate }}</span>
              </div>
            </div>
          </div>

          <!-- Footer Links Sections -->
          <ng-container *ngIf="footerData$ | async as footer">
            <div *ngFor="let section of footer.sections" class="lg:col-span-1">
            <h3 class="text-lg font-bold mb-6 font-['Poppins'] text-white">
              {{ section.title }}
            </h3>
            <ul class="space-y-3">
              <li *ngFor="let link of section.links">
                <a 
                  [href]="link.url" 
                  [target]="link.external ? '_blank' : '_self'"
                  [rel]="link.external ? 'noopener noreferrer' : ''"
                  class="text-gray-300 hover:text-[#0ACF83] transition-colors duration-300 text-sm font-['DM_Sans'] flex items-center gap-2 group"
                >
                  <span>{{ link.label }}</span>
                  <svg *ngIf="link.external" class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                </a>
              </li>
            </ul>
                      </div>
          </ng-container>

          <!-- Newsletter Signup -->
          <div *ngIf="footerData$ | async as footer" class="lg:col-span-1">
            <h3 class="text-lg font-bold mb-6 font-['Poppins'] text-white">
              {{ 'footer.newsletter' | translate }}
            </h3>
            <p class="text-gray-300 mb-6 text-sm leading-relaxed font-['DM_Sans']">
              {{ 'footer.newsletterDescription' | translate }}
            </p>
            
            <form class="space-y-4" (ngSubmit)="onNewsletterSubmit($event)">
              <div class="relative">
                <input 
                  type="email" 
                  [placeholder]="'footer.yourEmail' | translate"
                  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent transition-all duration-300"
                  required
                >
              </div>
              <button 
                type="submit"
                class="w-full bg-[#0ACF83] text-white font-semibold py-3 rounded-xl hover:bg-[#09b574] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {{ 'footer.subscribe' | translate }}
              </button>
            </form>
          </div>
        </div>

        <!-- Social Links -->
        <div *ngIf="footerData$ | async as footer" class="border-t border-white/20 mt-12 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-6">
            
            <!-- Social Media Links -->
            <div class="flex items-center gap-4">
              <span class="text-gray-300 text-sm font-medium">{{ 'footer.followUs' | translate }}</span>
              <div class="flex gap-3">
                <a 
                  *ngFor="let social of footer.socialLinks"
                  [href]="social.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0ACF83] transition-all duration-300 group"
                  [title]="social.platform"
                >
                  <div [innerHTML]="social.icon" class="w-5 h-5 text-gray-300 group-hover:text-white"></div>
                </a>
              </div>
            </div>

            <!-- Certifications/Badges -->
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <svg class="w-6 h-6 text-[#0ACF83]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.isoCertified' | translate }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-6 h-6 text-[#0ACF83]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.66c.03-.08.06-.17.09-.25C6.84 17.25 9.5 14.9 12 13.5c2.5 1.4 5.16 3.75 5.25 5.59.03.08.06.17.09.25l.95 2.66 1.89-.66C18.1 16.17 16 10 17 8z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.sustainable' | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-white/20 bg-heyhome-darker-green">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-gray-400 text-sm font-['DM_Sans']">
              © {{ currentYear }} SolarShop. {{ 'footer.allRightsReserved' | translate }}
            </p>
            
            <div class="flex items-center gap-6">
              <a href="/privacy" class="text-gray-400 hover:text-[#0ACF83] text-sm transition-colors duration-300">
                {{ 'footer.privacyPolicy' | translate }}
              </a>
              <a href="/terms" class="text-gray-400 hover:text-[#0ACF83] text-sm transition-colors duration-300">
                {{ 'footer.termsOfService' | translate }}
              </a>
              <a href="/cookies" class="text-gray-400 hover:text-[#0ACF83] text-sm transition-colors duration-300">
                {{ 'footer.cookiePolicy' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FooterComponent implements OnInit {
  private store = inject(Store);

  footerData$: Observable<FooterData | null>;
  currentYear = new Date().getFullYear();

  constructor() {
    this.footerData$ = this.store.select(selectFooterData);
  }

  ngOnInit(): void {
    this.store.dispatch(FooterActions.loadFooterData());
  }

  onNewsletterSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;

    if (emailInput && emailInput.value) {
      this.store.dispatch(FooterActions.subscribeNewsletter({ email: emailInput.value }));
      emailInput.value = '';
    }
  }
} 