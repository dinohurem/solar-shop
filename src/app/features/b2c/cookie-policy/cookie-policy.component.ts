import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-cookie-policy',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    template: `
    <div class="min-h-screen bg-white">
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-solar-600 to-solar-800 py-16 lg:py-24">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-['Poppins']">
            {{ 'cookiePolicy.title' | translate }}
          </h1>
          <p class="text-xl lg:text-2xl text-white opacity-80 max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'cookiePolicy.subtitle' | translate }}
          </p>
          <p class="text-lg text-white opacity-70 mt-4 font-['DM_Sans']">
            {{ 'cookiePolicy.lastUpdated' | translate }}
          </p>
        </div>
      </section>

      <!-- Content Section -->
      <section class="py-16 lg:py-24">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="prose prose-lg max-w-none">
            
            <!-- What Are Cookies -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'cookiePolicy.whatAreCookies.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'cookiePolicy.whatAreCookies.description' | translate }}
              </p>
            </div>

            <!-- Types of Cookies -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'cookiePolicy.typesOfCookies.title' | translate }}
              </h2>
              
              <div class="space-y-8">
                <!-- Essential Cookies -->
                <div class="bg-solar-50 p-6 rounded-2xl">
                  <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                    {{ 'cookiePolicy.typesOfCookies.essential.title' | translate }}
                  </h3>
                  <p class="text-gray-600 mb-4 font-['DM_Sans']">
                    {{ 'cookiePolicy.typesOfCookies.essential.description' | translate }}
                  </p>
                  <ul class="list-disc list-inside text-gray-600 space-y-2 font-['DM_Sans']">
                    <li>{{ 'cookiePolicy.typesOfCookies.essential.authentication' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.essential.cart' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.essential.security' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.essential.preferences' | translate }}</li>
                  </ul>
                </div>

                <!-- Performance Cookies -->
                <div class="bg-blue-50 p-6 rounded-2xl">
                  <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                    {{ 'cookiePolicy.typesOfCookies.performance.title' | translate }}
                  </h3>
                  <p class="text-gray-600 mb-4 font-['DM_Sans']">
                    {{ 'cookiePolicy.typesOfCookies.performance.description' | translate }}
                  </p>
                  <ul class="list-disc list-inside text-gray-600 space-y-2 font-['DM_Sans']">
                    <li>{{ 'cookiePolicy.typesOfCookies.performance.analytics' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.performance.usage' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.performance.errors' | translate }}</li>
                  </ul>
                </div>

                <!-- Functional Cookies -->
                <div class="bg-green-50 p-6 rounded-2xl">
                  <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                    {{ 'cookiePolicy.typesOfCookies.functional.title' | translate }}
                  </h3>
                  <p class="text-gray-600 mb-4 font-['DM_Sans']">
                    {{ 'cookiePolicy.typesOfCookies.functional.description' | translate }}
                  </p>
                  <ul class="list-disc list-inside text-gray-600 space-y-2 font-['DM_Sans']">
                    <li>{{ 'cookiePolicy.typesOfCookies.functional.language' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.functional.region' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.functional.accessibility' | translate }}</li>
                  </ul>
                </div>

                <!-- Marketing Cookies -->
                <div class="bg-purple-50 p-6 rounded-2xl">
                  <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                    {{ 'cookiePolicy.typesOfCookies.marketing.title' | translate }}
                  </h3>
                  <p class="text-gray-600 mb-4 font-['DM_Sans']">
                    {{ 'cookiePolicy.typesOfCookies.marketing.description' | translate }}
                  </p>
                  <ul class="list-disc list-inside text-gray-600 space-y-2 font-['DM_Sans']">
                    <li>{{ 'cookiePolicy.typesOfCookies.marketing.advertising' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.marketing.social' | translate }}</li>
                    <li>{{ 'cookiePolicy.typesOfCookies.marketing.tracking' | translate }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Third Party Cookies -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'cookiePolicy.thirdParty.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'cookiePolicy.thirdParty.description' | translate }}
              </p>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'cookiePolicy.thirdParty.googleAnalytics' | translate }}</li>
                <li>{{ 'cookiePolicy.thirdParty.socialMedia' | translate }}</li>
                <li>{{ 'cookiePolicy.thirdParty.paymentProcessors' | translate }}</li>
                <li>{{ 'cookiePolicy.thirdParty.supportTools' | translate }}</li>
              </ul>
            </div>

            <!-- Cookie Management -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'cookiePolicy.management.title' | translate }}
              </h2>
              
              <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                {{ 'cookiePolicy.management.browserSettings.title' | translate }}
              </h3>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'cookiePolicy.management.browserSettings.description' | translate }}
              </p>

              <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                {{ 'cookiePolicy.management.consent.title' | translate }}
              </h3>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'cookiePolicy.management.consent.description' | translate }}
              </p>

              <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                {{ 'cookiePolicy.management.optOut.title' | translate }}
              </h3>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'cookiePolicy.management.optOut.description' | translate }}
              </p>
            </div>

            <!-- Cookie Duration -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'cookiePolicy.duration.title' | translate }}
              </h2>
              <div class="space-y-4">
                <div>
                  <h4 class="text-lg font-semibold text-gray-800 mb-2 font-['Poppins']">
                    {{ 'cookiePolicy.duration.session.title' | translate }}
                  </h4>
                  <p class="text-gray-600 font-['DM_Sans']">
                    {{ 'cookiePolicy.duration.session.description' | translate }}
                  </p>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-gray-800 mb-2 font-['Poppins']">
                    {{ 'cookiePolicy.duration.persistent.title' | translate }}
                  </h4>
                  <p class="text-gray-600 font-['DM_Sans']">
                    {{ 'cookiePolicy.duration.persistent.description' | translate }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Updates to Policy -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'cookiePolicy.updates.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'cookiePolicy.updates.description' | translate }}
              </p>
            </div>

            <!-- Contact Information -->
            <div class="mb-12 bg-solar-50 p-8 rounded-2xl">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'cookiePolicy.contact.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-4 font-['DM_Sans']">
                {{ 'cookiePolicy.contact.description' | translate }}
              </p>
              <div class="space-y-2 text-gray-600 font-['DM_Sans']">
                <p><strong>{{ 'cookiePolicy.contact.email.label' | translate }}:</strong> {{ 'cookiePolicy.contact.email.value' | translate }}</p>
                <p><strong>{{ 'cookiePolicy.contact.phone.label' | translate }}:</strong> {{ 'cookiePolicy.contact.phone.value' | translate }}</p>
                <p><strong>{{ 'cookiePolicy.contact.address.label' | translate }}:</strong> {{ 'cookiePolicy.contact.address.value' | translate }}</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  `,
    styles: [`
    
    
    :host {
      display: block;
    }
  `]
})
export class CookiePolicyComponent {
} 