import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-privacy-policy',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    template: `
    <div class="min-h-screen bg-white">
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-solar-600 to-solar-800 py-16 lg:py-24">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-['Poppins']">
            {{ 'privacyPolicy.title' | translate }}
          </h1>
          <p class="text-xl lg:text-2xl text-white opacity-80 max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'privacyPolicy.subtitle' | translate }}
          </p>
          <p class="text-lg text-white opacity-70 mt-4 font-['DM_Sans']">
            {{ 'privacyPolicy.lastUpdated' | translate }}
          </p>
        </div>
      </section>

      <!-- Content Section -->
      <section class="py-16 lg:py-24">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="prose prose-lg max-w-none">
            
            <!-- Information We Collect -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'privacyPolicy.informationWeCollect.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'privacyPolicy.informationWeCollect.intro' | translate }}
              </p>
              
              <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                {{ 'privacyPolicy.informationWeCollect.personalInfo.title' | translate }}
              </h3>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'privacyPolicy.informationWeCollect.personalInfo.name' | translate }}</li>
                <li>{{ 'privacyPolicy.informationWeCollect.personalInfo.email' | translate }}</li>
                <li>{{ 'privacyPolicy.informationWeCollect.personalInfo.phone' | translate }}</li>
                <li>{{ 'privacyPolicy.informationWeCollect.personalInfo.address' | translate }}</li>
                <li>{{ 'privacyPolicy.informationWeCollect.personalInfo.payment' | translate }}</li>
              </ul>

              <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                {{ 'privacyPolicy.informationWeCollect.automaticInfo.title' | translate }}
              </h3>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'privacyPolicy.informationWeCollect.automaticInfo.ip' | translate }}</li>
                <li>{{ 'privacyPolicy.informationWeCollect.automaticInfo.browser' | translate }}</li>
                <li>{{ 'privacyPolicy.informationWeCollect.automaticInfo.device' | translate }}</li>
                <li>{{ 'privacyPolicy.informationWeCollect.automaticInfo.usage' | translate }}</li>
                <li>{{ 'privacyPolicy.informationWeCollect.automaticInfo.cookies' | translate }}</li>
              </ul>
            </div>

            <!-- How We Use Information -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'privacyPolicy.howWeUse.title' | translate }}
              </h2>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'privacyPolicy.howWeUse.processOrders' | translate }}</li>
                <li>{{ 'privacyPolicy.howWeUse.customerService' | translate }}</li>
                <li>{{ 'privacyPolicy.howWeUse.communication' | translate }}</li>
                <li>{{ 'privacyPolicy.howWeUse.marketing' | translate }}</li>
                <li>{{ 'privacyPolicy.howWeUse.analytics' | translate }}</li>
                <li>{{ 'privacyPolicy.howWeUse.legal' | translate }}</li>
              </ul>
            </div>

            <!-- Information Sharing -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'privacyPolicy.sharing.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'privacyPolicy.sharing.intro' | translate }}
              </p>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'privacyPolicy.sharing.serviceProviders' | translate }}</li>
                <li>{{ 'privacyPolicy.sharing.legal' | translate }}</li>
                <li>{{ 'privacyPolicy.sharing.business' | translate }}</li>
                <li>{{ 'privacyPolicy.sharing.consent' | translate }}</li>
              </ul>
            </div>

            <!-- Data Security -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'privacyPolicy.security.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'privacyPolicy.security.description' | translate }}
              </p>
            </div>

            <!-- Your Rights -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'privacyPolicy.rights.title' | translate }}
              </h2>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'privacyPolicy.rights.access' | translate }}</li>
                <li>{{ 'privacyPolicy.rights.correct' | translate }}</li>
                <li>{{ 'privacyPolicy.rights.delete' | translate }}</li>
                <li>{{ 'privacyPolicy.rights.restrict' | translate }}</li>
                <li>{{ 'privacyPolicy.rights.portability' | translate }}</li>
                <li>{{ 'privacyPolicy.rights.object' | translate }}</li>
              </ul>
            </div>

            <!-- Contact Information -->
            <div class="mb-12 bg-solar-50 p-8 rounded-2xl">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'privacyPolicy.contact.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-4 font-['DM_Sans']">
                {{ 'privacyPolicy.contact.description' | translate }}
              </p>
              <div class="space-y-2 text-gray-600 font-['DM_Sans']">
                <p><strong>{{ 'privacyPolicy.contact.email.label' | translate }}:</strong> {{ 'privacyPolicy.contact.email.value' | translate }}</p>
                <p><strong>{{ 'privacyPolicy.contact.phone.label' | translate }}:</strong> {{ 'privacyPolicy.contact.phone.value' | translate }}</p>
                <p><strong>{{ 'privacyPolicy.contact.address.label' | translate }}:</strong> {{ 'privacyPolicy.contact.address.value' | translate }}</p>
              </div>
            </div>

            <!-- Changes to Policy -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'privacyPolicy.changes.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'privacyPolicy.changes.description' | translate }}
              </p>
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
export class PrivacyPolicyComponent {
} 