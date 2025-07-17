import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FooterActions } from './store/footer.actions';
import { selectFooterData, selectNewsletterState } from './store/footer.selectors';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  template: `
    <!-- Footer -->
    <footer class="bg-black text-white">
      <!-- Main Footer Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          <!-- Company Info -->
          <div class="lg:col-span-1">
            <div class="mb-6">
              <img src="assets/images/logo.png" alt="SolarShop" class="h-10 w-auto mb-4 ">
              <p class="text-gray-300 leading-relaxed font-['DM_Sans']">
                {{ 'footer.companyDescription' | translate }}
              </p>
            </div>
            
            <!-- Contact Info -->
            <div *ngIf="footerData$ | async as footer" class="space-y-3">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-solar-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.address' | translate }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-solar-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <a href="tel:016407715" class="text-gray-300 text-sm hover:text-solar-400 transition-colors duration-300">
                  {{ 'footer.phone' | translate }}
                </a>
              </div>
              
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-solar-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <a href="mailto:info@solarni-paneli.hr" class="text-gray-300 text-sm hover:text-solar-400 transition-colors duration-300">
                  {{ 'footer.email' | translate }}
                </a>
              </div>
              
              <!-- <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-solar-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.hours' | translate }}</span>
              </div> -->
            </div>
          </div>

          <!-- Products Column -->
          <div class="lg:col-span-1">
            <h3 class="text-lg font-bold mb-6 font-['Poppins'] text-white">
              {{ 'nav.products' | translate }}
            </h3>
            <ul class="space-y-3">
              <li>
                <a 
                  routerLink="/proizvodi"
                  class="text-gray-300 hover:text-solar-400 transition-colors duration-300 text-sm font-['DM_Sans']"
                >
                  {{ 'nav.products' | translate }}
                </a>
              </li>
              <li>
                <a 
                  routerLink="/ponude"
                  class="text-gray-300 hover:text-solar-400 transition-colors duration-300 text-sm font-['DM_Sans']"
                >
                  {{ 'nav.offers' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Blog Column -->
          <div class="lg:col-span-1">
            <h3 class="text-lg font-bold mb-6 font-['Poppins'] text-white">
              {{ 'nav.blog' | translate }}
            </h3>
            <ul class="space-y-3">
              <li>
                <a 
                  routerLink="/blog"
                  class="text-gray-300 hover:text-solar-400 transition-colors duration-300 text-sm font-['DM_Sans']"
                >
                  {{ 'nav.blog' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Company Column -->
          <div class="lg:col-span-1">
            <h3 class="text-lg font-bold mb-6 font-['Poppins'] text-white">
              {{ 'nav.company' | translate }}
            </h3>
            <ul class="space-y-3">
              <li>
                <a 
                  routerLink="/tvrtka"
                  class="text-gray-300 hover:text-solar-400 transition-colors duration-300 text-sm font-['DM_Sans']"
                >
                  {{ 'nav.company' | translate }}
                </a>
              </li>
              <li>
                <a 
                  routerLink="/kontakt"
                  class="text-gray-300 hover:text-solar-400 transition-colors duration-300 text-sm font-['DM_Sans']"
                >
                  {{ 'nav.contact' | translate }}
                </a>
              </li>
              <li>
                <a 
                  routerLink="/partneri"
                  class="text-gray-300 hover:text-solar-400 transition-colors duration-300 text-sm font-['DM_Sans']"
                >
                  {{ 'nav.partners' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Newsletter Signup -->
          <div *ngIf="footerData$ | async as footer" class="lg:col-span-1">
            <h3 class="text-lg font-bold mb-6 font-['Poppins'] text-white">
              {{ 'footer.newsletter' | translate }}
            </h3>
            <p class="text-gray-300 mb-6 text-sm leading-relaxed font-['DM_Sans']">
              {{ 'footer.newsletterDescription' | translate }}
            </p>
            
            <form class="space-y-4" #newsletterForm="ngForm" (ngSubmit)="onNewsletterSubmit($event, newsletterForm)">
              <div class="relative">
                <input 
                  type="email" 
                  name="email"
                  [placeholder]="'footer.yourEmail' | translate"
                  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-solar-400 focus:border-transparent transition-all duration-300"
                  required
                  #emailInput
                  ngModel
                >
              </div>
              <button 
                type="submit"
                [class]="(newsletterState$ | async)?.success ? 'w-full bg-green-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg' : 'w-full bg-solar-500 text-white font-semibold py-3 rounded-xl hover:bg-solar-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'"
                [disabled]="(newsletterState$ | async)?.loading || !newsletterForm.valid"
              >
                {{ (newsletterState$ | async)?.success ? ('footer.subscribed' | translate) : ('footer.subscribe' | translate) }}
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
                  class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-solar-500 transition-all duration-300 group"
                  [title]="social.platform"
                >
                  <div [innerHTML]="sanitizeIcon(social.icon)" class="w-5 h-5 text-gray-300 group-hover:text-white"></div>
                </a>
              </div>
            </div>

            <!-- Certifications/Badges -->
            <!-- <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <svg class="w-6 h-6 text-solar-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-6 h-6 text-solar-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.66c.03-.08.06-.17.09-.25C6.84 17.25 9.5 14.9 12 13.5c2.5 1.4 5.16 3.75 5.25 5.59.03.08.06.17.09.25l.95 2.66 1.89-.66C18.1 16.17 16 10 17 8z"/>
                </svg>
                <span class="text-gray-300 text-sm">{{ 'footer.sustainable' | translate }}</span>
              </div>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-white/20 bg-black">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-gray-400 text-sm font-['DM_Sans']">
              © {{ currentYear }} SolarShop. {{ 'footer.allRightsReserved' | translate }}
            </p>
            
            <div class="flex items-center gap-6">
              <a href="/privatnost" class="text-gray-400 hover:text-solar-400 text-sm transition-colors duration-300">
                {{ 'footer.privacyPolicy' | translate }}
              </a>
              <a href="/uvjeti" class="text-gray-400 hover:text-solar-400 text-sm transition-colors duration-300">
                {{ 'footer.termsOfService' | translate }}
              </a>
              <a href="/kolacici" class="text-gray-400 hover:text-solar-400 text-sm transition-colors duration-300">
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
  private sanitizer = inject(DomSanitizer);

  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('newsletterForm') newsletterForm!: NgForm;

  footerData$: Observable<FooterData | null>;
  newsletterState$: Observable<{ loading: boolean; success: boolean; error: string | null }>;
  currentYear = new Date().getFullYear();

  constructor() {
    this.footerData$ = this.store.select(selectFooterData);
    this.newsletterState$ = this.store.select(selectNewsletterState);
  }

  ngOnInit(): void {
    this.store.dispatch(FooterActions.loadFooterData());
  }

  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  onNewsletterSubmit(event: Event, form: NgForm): void {
    event.preventDefault();

    if (form.valid) {
      const emailValue = this.emailInput.nativeElement.value;
      console.log('Submitting newsletter with email:', emailValue); // Debug log

      this.store.dispatch(FooterActions.subscribeNewsletter({ email: emailValue }));
      form.resetForm();

      // Reset success state after 3 seconds
      setTimeout(() => {
        this.store.dispatch(FooterActions.resetNewsletterState());
      }, 3000);
    }
  }
} 