import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-partners-about',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-solar-600 to-solar-800 py-16 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {{ 'b2b.about.title' | translate }}
          </h1>
          <p class="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'b2b.about.subtitle' | translate }}
          </p>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'b2b.about.benefits' | translate }}
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Exclusive Pricing -->
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
              <div class="w-16 h-16 bg-solar-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.exclusivePricing' | translate }}
              </h3>
              <p class="text-gray-600 font-['DM_Sans']">
                {{ 'b2b.about.exclusivePricingText' | translate }}
              </p>
            </div>

            <!-- Dedicated Support -->
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
              <div class="w-16 h-16 bg-solar-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.dedicatedSupport' | translate }}
              </h3>
              <p class="text-gray-600 font-['DM_Sans']">
                {{ 'b2b.about.dedicatedSupportText' | translate }}
              </p>
            </div>

            <!-- Marketing Support -->
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
              <div class="w-16 h-16 bg-solar-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.marketingSupport' | translate }}
              </h3>
              <p class="text-gray-600 font-['DM_Sans']">
                {{ 'b2b.about.marketingSupportText' | translate }}
              </p>
            </div>

            <!-- Training -->
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
              <div class="w-16 h-16 bg-solar-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.training' | translate }}
              </h3>
              <p class="text-gray-600 font-['DM_Sans']">
                {{ 'b2b.about.trainingText' | translate }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Requirements Section -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'b2b.about.requirements' | translate }}
            </h2>
            <p class="text-lg text-gray-600 font-['DM_Sans']">
              {{ 'b2b.about.requirementsText' | translate }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Business Experience -->
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                  {{ 'b2b.about.businessExperience' | translate }}
                </h3>
                <p class="text-gray-600 font-['DM_Sans']">
                  {{ 'b2b.about.businessExperienceText' | translate }}
                </p>
              </div>
            </div>

            <!-- Financial Stability -->
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                  {{ 'b2b.about.financialStability' | translate }}
                </h3>
                <p class="text-gray-600 font-['DM_Sans']">
                  {{ 'b2b.about.financialStabilityText' | translate }}
                </p>
              </div>
            </div>

            <!-- Technical Capability -->
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                  {{ 'b2b.about.technicalCapability' | translate }}
                </h3>
                <p class="text-gray-600 font-['DM_Sans']">
                  {{ 'b2b.about.technicalCapabilityText' | translate }}
                </p>
              </div>
            </div>

            <!-- Commitment to Quality -->
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                  {{ 'b2b.about.commitment' | translate }}
                </h3>
                <p class="text-gray-600 font-['DM_Sans']">
                  {{ 'b2b.about.commitmentText' | translate }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 bg-solar-600">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl font-bold text-white mb-4 font-['Poppins']">
            Ready to Join Our Partner Network?
          </h2>
          <p class="text-xl text-white/90 mb-8 font-['DM_Sans']">
            Start your application today and unlock exclusive benefits for your business.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button (click)="navigateToRegister()" 
                    class="bg-white text-solar-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all">
              {{ 'b2b.hero.getStarted' | translate }}
            </button>
            <button (click)="navigateToContact()" 
                    class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class PartnersAboutComponent {
    constructor(private router: Router) { }

    navigateToRegister(): void {
        this.router.navigate(['/partners/register']);
    }

    navigateToContact(): void {
        this.router.navigate(['/partners/contact']);
    }
} 