import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-terms-of-service',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    template: `
    <div class="min-h-screen bg-white">
      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-solar-600 to-solar-800 py-16 lg:py-24">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-['Poppins']">
            {{ 'termsOfService.title' | translate }}
          </h1>
          <p class="text-xl lg:text-2xl text-white opacity-80 max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'termsOfService.subtitle' | translate }}
          </p>
          <p class="text-lg text-white opacity-70 mt-4 font-['DM_Sans']">
            {{ 'termsOfService.lastUpdated' | translate }}
          </p>
        </div>
      </section>

      <!-- Content Section -->
      <section class="py-16 lg:py-24">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="prose prose-lg max-w-none">
            
            <!-- Acceptance of Terms -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.acceptance.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.acceptance.description' | translate }}
              </p>
            </div>

            <!-- Services Description -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.services.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.services.description' | translate }}
              </p>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'termsOfService.services.products' | translate }}</li>
                <li>{{ 'termsOfService.services.consultation' | translate }}</li>
                <li>{{ 'termsOfService.services.installation' | translate }}</li>
                <li>{{ 'termsOfService.services.support' | translate }}</li>
                <li>{{ 'termsOfService.services.maintenance' | translate }}</li>
              </ul>
            </div>

            <!-- User Accounts -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.accounts.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.accounts.description' | translate }}
              </p>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'termsOfService.accounts.accurate' | translate }}</li>
                <li>{{ 'termsOfService.accounts.secure' | translate }}</li>
                <li>{{ 'termsOfService.accounts.responsible' | translate }}</li>
                <li>{{ 'termsOfService.accounts.notify' | translate }}</li>
              </ul>
            </div>

            <!-- Orders and Payment -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.orders.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.orders.description' | translate }}
              </p>
              
              <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                {{ 'termsOfService.orders.pricing.title' | translate }}
              </h3>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.orders.pricing.description' | translate }}
              </p>

              <h3 class="text-xl font-semibold text-gray-800 mb-4 font-['Poppins']">
                {{ 'termsOfService.orders.payment.title' | translate }}
              </h3>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.orders.payment.description' | translate }}
              </p>
            </div>

            <!-- Shipping and Delivery -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.shipping.title' | translate }}
              </h2>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'termsOfService.shipping.processing' | translate }}</li>
                <li>{{ 'termsOfService.shipping.delivery' | translate }}</li>
                <li>{{ 'termsOfService.shipping.risk' | translate }}</li>
                <li>{{ 'termsOfService.shipping.damages' | translate }}</li>
              </ul>
            </div>

            <!-- Returns and Refunds -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.returns.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.returns.description' | translate }}
              </p>
              <ul class="list-disc list-inside text-gray-600 mb-6 space-y-2 font-['DM_Sans']">
                <li>{{ 'termsOfService.returns.timeLimit' | translate }}</li>
                <li>{{ 'termsOfService.returns.condition' | translate }}</li>
                <li>{{ 'termsOfService.returns.authorization' | translate }}</li>
                <li>{{ 'termsOfService.returns.refund' | translate }}</li>
              </ul>
            </div>

            <!-- Warranties -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.warranties.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.warranties.description' | translate }}
              </p>
            </div>

            <!-- Limitation of Liability -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.liability.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.liability.description' | translate }}
              </p>
            </div>

            <!-- Intellectual Property -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.intellectual.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.intellectual.description' | translate }}
              </p>
            </div>

            <!-- Governing Law -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.law.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.law.description' | translate }}
              </p>
            </div>

            <!-- Contact Information -->
            <div class="mb-12 bg-solar-50 p-8 rounded-2xl">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.contact.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-4 font-['DM_Sans']">
                {{ 'termsOfService.contact.description' | translate }}
              </p>
              <div class="space-y-2 text-gray-600 font-['DM_Sans']">
                <p><strong>{{ 'termsOfService.contact.email.label' | translate }}:</strong> {{ 'termsOfService.contact.email.value' | translate }}</p>
                <p><strong>{{ 'termsOfService.contact.phone.label' | translate }}:</strong> {{ 'termsOfService.contact.phone.value' | translate }}</p>
                <p><strong>{{ 'termsOfService.contact.address.label' | translate }}:</strong> {{ 'termsOfService.contact.address.value' | translate }}</p>
              </div>
            </div>

            <!-- Changes to Terms -->
            <div class="mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'termsOfService.changes.title' | translate }}
              </h2>
              <p class="text-gray-600 mb-6 font-['DM_Sans']">
                {{ 'termsOfService.changes.description' | translate }}
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    
    :host {
      display: block;
    }
  `]
})
export class TermsOfServiceComponent {
} 