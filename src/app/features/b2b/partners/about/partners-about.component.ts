import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-partners-about',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-solar-600 to-solar-800 text-white py-20">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl lg:text-5xl font-bold font-['Poppins'] mb-6">
            {{ 'b2b.about.heroTitle' | translate }}
          </h1>
          <p class="text-xl lg:text-2xl text-solar-100 max-w-3xl mx-auto leading-relaxed font-['DM_Sans']">
            {{ 'b2b.about.heroSubtitle' | translate }}
          </p>
        </div>
      </section>

      <!-- Special Pricing Section -->
      <section class="py-16 lg:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'b2b.about.pricingTitle' | translate }}
              </h2>
              <p class="text-xl text-solar-600 mb-6 font-['DM_Sans']">
                {{ 'b2b.about.pricingSubtitle' | translate }}
              </p>
              <p class="text-gray-600 mb-8 leading-relaxed font-['DM_Sans']">
                {{ 'b2b.about.pricingDescription' | translate }}
              </p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.about.pricingBenefits.volumeDiscounts' | translate }}
                  </h3>
                  <p class="text-gray-600 text-sm font-['DM_Sans']">
                    {{ 'b2b.about.pricingBenefits.volumeDiscountsText' | translate }}
                  </p>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.about.pricingBenefits.tierPricing' | translate }}
                  </h3>
                  <p class="text-gray-600 text-sm font-['DM_Sans']">
                    {{ 'b2b.about.pricingBenefits.tierPricingText' | translate }}
                  </p>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.about.pricingBenefits.earlyAccess' | translate }}
                  </h3>
                  <p class="text-gray-600 text-sm font-['DM_Sans']">
                    {{ 'b2b.about.pricingBenefits.earlyAccessText' | translate }}
                  </p>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="w-12 h-12 bg-solar-100 rounded-lg flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                    {{ 'b2b.about.pricingBenefits.specialOffers' | translate }}
                  </h3>
                  <p class="text-gray-600 text-sm font-['DM_Sans']">
                    {{ 'b2b.about.pricingBenefits.specialOffersText' | translate }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="flex justify-center">
              <div class="relative">
                <div class="w-96 h-96 bg-gradient-to-br from-solar-100 to-solar-200 rounded-full flex items-center justify-center">
                  <div class="text-8xl text-solar-600">💰</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Superior Support Section -->
      <section class="py-16 lg:py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="flex justify-center order-2 lg:order-1">
              <div class="w-96 h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <div class="text-8xl text-blue-600">🎧</div>
              </div>
            </div>
            
            <div class="order-1 lg:order-2">
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 font-['Poppins']">
                {{ 'b2b.about.supportTitle' | translate }}
              </h2>
              <p class="text-xl text-solar-600 mb-6 font-['DM_Sans']">
                {{ 'b2b.about.supportSubtitle' | translate }}
              </p>
              <p class="text-gray-600 mb-8 leading-relaxed font-['DM_Sans']">
                {{ 'b2b.about.supportDescription' | translate }}
              </p>
              
              <div class="space-y-6">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                      {{ 'b2b.about.supportBenefits.personalManager' | translate }}
                    </h3>
                    <p class="text-gray-600 font-['DM_Sans']">
                      {{ 'b2b.about.supportBenefits.personalManagerText' | translate }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                      {{ 'b2b.about.supportBenefits.technicalSupport' | translate }}
                    </h3>
                    <p class="text-gray-600 font-['DM_Sans']">
                      {{ 'b2b.about.supportBenefits.technicalSupportText' | translate }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                      {{ 'b2b.about.supportBenefits.priorityService' | translate }}
                    </h3>
                    <p class="text-gray-600 font-['DM_Sans']">
                      {{ 'b2b.about.supportBenefits.priorityServiceText' | translate }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Marketing & Education Section -->
      <section class="py-16 lg:py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 font-['Poppins']">
              {{ 'b2b.about.marketingTitle' | translate }}
            </h2>
            <p class="text-xl text-solar-600 max-w-3xl mx-auto font-['DM_Sans']">
              {{ 'b2b.about.marketingSubtitle' | translate }}
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
              <div class="w-16 h-16 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.marketingBenefits.marketingMaterials' | translate }}
              </h3>
              <p class="text-gray-600 text-sm font-['DM_Sans']">
                {{ 'b2b.about.marketingBenefits.marketingMaterialsText' | translate }}
              </p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
              <div class="w-16 h-16 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.marketingBenefits.training' | translate }}
              </h3>
              <p class="text-gray-600 text-sm font-['DM_Sans']">
                {{ 'b2b.about.marketingBenefits.trainingText' | translate }}
              </p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
              <div class="w-16 h-16 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.marketingBenefits.certification' | translate }}
              </h3>
              <p class="text-gray-600 text-sm font-['DM_Sans']">
                {{ 'b2b.about.marketingBenefits.certificationText' | translate }}
              </p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
              <div class="w-16 h-16 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.marketingBenefits.events' | translate }}
              </h3>
              <p class="text-gray-600 text-sm font-['DM_Sans']">
                {{ 'b2b.about.marketingBenefits.eventsText' | translate }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Requirements Section -->
      <section class="py-16 lg:py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 font-['Poppins']">
              {{ 'b2b.about.requirementsTitle' | translate }}
            </h2>
            <p class="text-xl text-solar-600 max-w-3xl mx-auto font-['DM_Sans']">
              {{ 'b2b.about.requirementsSubtitle' | translate }}
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-12">
            <div class="text-center">
              <div class="w-16 h-16 bg-solar-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.businessExperience' | translate }}
              </h3>
              <p class="text-gray-600 text-sm font-['DM_Sans']">
                {{ 'b2b.about.businessExperienceText' | translate }}
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-solar-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.financialStability' | translate }}
              </h3>
              <p class="text-gray-600 text-sm font-['DM_Sans']">
                {{ 'b2b.about.financialStabilityText' | translate }}
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-solar-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                {{ 'b2b.about.commitment' | translate }}
              </h3>
              <p class="text-gray-600 text-sm font-['DM_Sans']">
                {{ 'b2b.about.commitmentText' | translate }}
              </p>
            </div>
          </div>
          
          <!-- Application Process -->
          <div class="bg-gray-50 rounded-2xl p-8 lg:p-12">
            <div class="text-center mb-8">
              <h3 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 font-['Poppins']">
                {{ 'b2b.about.applicationProcess' | translate }}
              </h3>
              <p class="text-lg text-solar-600 font-['DM_Sans']">
                {{ 'b2b.about.applicationProcessText' | translate }}
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="text-center">
                <div class="w-16 h-16 bg-solar-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white font-bold text-xl font-['Poppins']">1</span>
                </div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                  {{ 'b2b.about.stepOne' | translate }}
                </h4>
                <p class="text-gray-600 font-['DM_Sans']">
                  {{ 'b2b.about.stepOneText' | translate }}
                </p>
              </div>
              
              <div class="text-center">
                <div class="w-16 h-16 bg-solar-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white font-bold text-xl font-['Poppins']">2</span>
                </div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                  {{ 'b2b.about.stepTwo' | translate }}
                </h4>
                <p class="text-gray-600 font-['DM_Sans']">
                  {{ 'b2b.about.stepTwoText' | translate }}
                </p>
              </div>
              
              <div class="text-center">
                <div class="w-16 h-16 bg-solar-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white font-bold text-xl font-['Poppins']">3</span>
                </div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2 font-['Poppins']">
                  {{ 'b2b.about.stepThree' | translate }}
                </h4>
                <p class="text-gray-600 font-['DM_Sans']">
                  {{ 'b2b.about.stepThreeText' | translate }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 lg:py-24 bg-gradient-to-r from-solar-600 to-solar-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6 font-['Poppins']">
            {{ 'b2b.about.readyToJoin' | translate }}
          </h2>
          <p class="text-xl text-solar-100 mb-8 max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'b2b.about.startApplicationToday' | translate }}
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/partneri/registracija" 
               class="bg-white text-solar-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center font-['DM_Sans']">
              {{ 'b2b.about.applyNow' | translate }}
            </a>
            <a routerLink="/partneri/kontakt" 
               class="bg-solar-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-solar-400 transition-colors inline-flex items-center justify-center font-['DM_Sans']">
              {{ 'b2b.about.contactUs' | translate }}
            </a>
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
export class PartnersAboutComponent {

}