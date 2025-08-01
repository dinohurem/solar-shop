import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-safety-payment',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 class="text-3xl font-bold text-gray-900 font-['Poppins']">
            {{ 'safetyPayment.title' | translate }}
          </h1>
          <p class="mt-2 text-gray-600 font-['DM_Sans']">
            {{ 'safetyPayment.subtitle' | translate }}
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          <!-- Credit Card Security Section -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'safetyPayment.creditCardSecurity.title' | translate }}
            </h2>
            <div class="space-y-4 text-gray-700 leading-relaxed font-['DM_Sans']">
              <p>{{ 'safetyPayment.creditCardSecurity.intro' | translate }}</p>
              <p>{{ 'safetyPayment.creditCardSecurity.sslDescription' | translate }}</p>
              <p>{{ 'safetyPayment.creditCardSecurity.dataTransfer' | translate }}</p>
              <p>{{ 'safetyPayment.creditCardSecurity.vpnSecurity' | translate }}</p>
              <p>{{ 'safetyPayment.creditCardSecurity.pciCompliance' | translate }}</p>
              <p>{{ 'safetyPayment.creditCardSecurity.merchantSecurity' | translate }}</p>
            </div>
          </div>

          <!-- Privacy Statement -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'safetyPayment.privacyStatement.title' | translate }}
            </h2>
            <div class="space-y-4 text-gray-700 leading-relaxed font-['DM_Sans']">
              <p>{{ 'safetyPayment.privacyStatement.commitment' | translate }}</p>
              <p>{{ 'safetyPayment.privacyStatement.dataAccess' | translate }}</p>
              <p>{{ 'safetyPayment.privacyStatement.employeeResponsibility' | translate }}</p>
            </div>
          </div>

          <!-- Terms of Use -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'safetyPayment.termsOfUse.title' | translate }}
            </h2>
            <div class="space-y-4 text-gray-700 leading-relaxed font-['DM_Sans']">
              <p>{{ 'safetyPayment.termsOfUse.ownership' | translate }}</p>
              <p>{{ 'safetyPayment.termsOfUse.availability' | translate }}</p>
              <p>{{ 'safetyPayment.termsOfUse.compliance' | translate }}</p>
              <p>{{ 'safetyPayment.termsOfUse.pricing' | translate }}</p>
              <p>{{ 'safetyPayment.termsOfUse.payment' | translate }}</p>
              <p>{{ 'safetyPayment.termsOfUse.delivery' | translate }}</p>
              <p>{{ 'safetyPayment.termsOfUse.accuracy' | translate }}</p>
              <p>{{ 'safetyPayment.termsOfUse.warranty' | translate }}</p>
              <p>{{ 'safetyPayment.termsOfUse.dataCollection' | translate }}</p>
            </div>
          </div>

          <!-- Ordering Section -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'safetyPayment.ordering.title' | translate }}
            </h2>
            <div class="space-y-4 text-gray-700 leading-relaxed font-['DM_Sans']">
              <p>{{ 'safetyPayment.ordering.process' | translate }}</p>
              <p>{{ 'safetyPayment.ordering.pricing' | translate }}</p>
              <p>{{ 'safetyPayment.ordering.completion' | translate }}</p>
            </div>
          </div>

          <!-- Payment Section -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'safetyPayment.paymentSection.title' | translate }}
            </h2>
            <p class="text-gray-700 leading-relaxed font-['DM_Sans']">
              {{ 'safetyPayment.paymentSection.methods' | translate }}
            </p>
          </div>

          <!-- Delivery Section -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'safetyPayment.delivery.title' | translate }}
            </h2>
            <div class="space-y-4 text-gray-700 leading-relaxed font-['DM_Sans']">
              <p>{{ 'safetyPayment.delivery.packaging' | translate }}</p>
              <p>{{ 'safetyPayment.delivery.inspection' | translate }}</p>
              <p>{{ 'safetyPayment.delivery.nonReceipt' | translate }}</p>
              <p>{{ 'safetyPayment.delivery.refusal' | translate }}</p>
              <p>{{ 'safetyPayment.delivery.timeline' | translate }}</p>
              <p>{{ 'safetyPayment.delivery.courierResponsibility' | translate }}</p>
              <p>{{ 'safetyPayment.delivery.downloadOption' | translate }}</p>
            </div>
          </div>

          <!-- Complaints Section -->
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
              {{ 'safetyPayment.complaints.title' | translate }}
            </h2>
            <div class="space-y-4 text-gray-700 leading-relaxed font-['DM_Sans']">
              <p>{{ 'safetyPayment.complaints.guarantee' | translate }}</p>
              <p>{{ 'safetyPayment.complaints.imageDisclaimer' | translate }}</p>
              <p>{{ 'safetyPayment.complaints.technicalIssues' | translate }}</p>
              <p>{{ 'safetyPayment.complaints.procedure' | translate }}</p>
              <p>{{ 'safetyPayment.complaints.replacement' | translate }}</p>
              <p>{{ 'safetyPayment.complaints.noRefund' | translate }}</p>
              <p>{{ 'safetyPayment.complaints.courierLimitation' | translate }}</p>
              <p>{{ 'safetyPayment.complaints.downloadIssues' | translate }}</p>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="bg-solar-50 rounded-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-3 font-['Poppins']">
              {{ 'safetyPayment.contact.title' | translate }}
            </h2>
            <p class="text-gray-700 leading-relaxed font-['DM_Sans']">
              {{ 'safetyPayment.contact.content' | translate }}
            </p>
            <div class="mt-4 flex flex-col sm:flex-row gap-4">
              <a href="mailto:info@solarni-paneli.hr" 
                 class="inline-flex items-center px-4 py-2 bg-solar-600 text-white rounded-lg hover:bg-solar-700 transition-colors duration-300">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                {{ 'safetyPayment.contact.email' | translate }}
              </a>
              <a href="tel:016407715" 
                 class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                {{ 'safetyPayment.contact.phone' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class SafetyPaymentComponent {
}