import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <!-- Hero Section with Video -->
    <section class="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      <video
        autoplay
        muted
        loop
        playsinline
        poster="assets/videos/hero-poster.jpg"
        class="absolute inset-0 w-full h-full object-cover"
      >
        <source src="assets/videos/hero-video.mp4" type="video/mp4">
      </video>
    </section>

    <!-- About Us Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-white">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Content -->
          <div class="space-y-6">
            <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 leading-tight">
              {{ 'company.whoWeAre' | translate }}
            </h2>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
              {{ 'company.whoWeAreText' | translate }}
            </p>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
              {{ 'company.mission' | translate }}
            </p>
          </div>
          
          <!-- Image -->
          <div class="order-first lg:order-last">
            <div class="bg-gray-200 rounded-3xl h-96 flex items-center justify-center">
              <img src="assets/images/logo.png" alt="Company Image" class="w-full h-auto object-fit">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col lg:flex-row gap-12">
          <!-- Team Info -->
          <div class="lg:w-full space-y-6">
            <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 text-center lg:text-left leading-tight">
              {{ 'company.ourTeam' | translate }}
            </h2>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
              {{ 'company.teamText1' | translate }}
            </p>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
              {{ 'company.teamText2' | translate }}
            </p>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
              {{ 'company.teamText3' | translate }}
            </p>
            <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
              {{ 'company.teamText4' | translate }}
            </p>
          </div>
          
          <!-- Team Grid -->
          <!-- <div class="lg:w-1/2">
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">Michael Harrington</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Founder & CEO</p>
                </div>
              </div>
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">James O'Connor</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Technical Consultant</p>
                </div>
              </div>
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">Ralph Edwards</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Senior Project Manager</p>
                </div>
              </div>
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">Liam Evans</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Head of Technical Solutions</p>
                </div>
              </div>
            </div>
            
            
            <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">Sophia Martinez</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Lead Architect</p>
                </div>
              </div>
              <div class="text-center space-y-3">
                <div class="bg-gray-300 rounded-2xl h-32 w-full"></div>
                <div>
                  <h3 class="font-['DM_Sans'] font-bold text-sm text-gray-800">James O'Connor</h3>
                  <p class="font-['DM_Sans'] font-light text-xs text-gray-600">Technical Consultant</p>
                </div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    </section>

    <!-- Mission & Values Section -->
    <section class="relative py-16 px-4 md:px-8 lg:px-32 bg-solar-50">
      <!-- Background Decorative Element -->
      <div class="absolute top-0 right-0 w-80 h-80 opacity-20">
        <div class="w-full h-full bg-solar-200 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div class="max-w-6xl mx-auto relative z-10">
        <div class="text-center mb-12">
          <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 mb-8 leading-tight">
            {{ 'company.missionValues' | translate }}
          </h2>
          
          <!-- Values Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- First Row -->
            <div class="flex items-start space-x-4 text-left">
              <div class="w-10 h-10 bg-solar-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800 mb-2">{{ 'company.quality' | translate }}</h3>
                <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                  {{ 'company.qualityText' | translate }}
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 text-left">
              <div class="w-10 h-10 bg-solar-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800 mb-2">{{ 'company.innovation' | translate }}</h3>
                <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                  {{ 'company.innovationText' | translate }}
                </p>
              </div>
            </div>
            
            <!-- Second Row -->
            <div class="flex items-start space-x-4 text-left">
              <div class="w-10 h-10 bg-solar-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012-2v-1a2 2 0 012-2h1.945M11 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800 mb-2">{{ 'company.sustainability' | translate }}</h3>
                <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                  {{ 'company.sustainabilityText' | translate }}
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4 text-left">
              <div class="w-10 h-10 bg-solar-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                </svg>
              </div>
              <div>
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800 mb-2">{{ 'company.support' | translate }}</h3>
                <p class="font-['DM_Sans'] text-sm text-gray-600 leading-relaxed">
                  {{ 'company.supportText' | translate }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <!-- <section class="py-16 px-4 md:px-8 lg:px-32 bg-white">
      <div class="max-w-6xl mx-auto text-center">
        <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 mb-6 leading-tight">
          {{ 'company.suppliersPartners' | translate }}
        </h2>
        <p class="font-['DM_Sans'] text-base text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          {{ 'company.partnersText' | translate }}
        </p>
        
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div class="bg-solar-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in reprehenderit in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
          
          <div class="bg-solar-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
          
          <div class="bg-solar-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in reprehenderit in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
          
          <div class="bg-solar-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in reprehenderit in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
          
          <div class="bg-solar-50 rounded-2xl p-6 text-center">
            <div class="bg-gray-200 h-16 rounded-lg mb-4 flex items-center justify-center">
              <span class="text-gray-500 text-xs">Logo</span>
            </div>
            <h3 class="font-['DM_Sans'] font-semibold text-sm text-gray-800 mb-2">Company name</h3>
            <p class="font-['DM_Sans'] text-xs text-gray-600 leading-relaxed">
              Description dolor in reprehenderit in voluptate velit esse fugiat nulla pariatur. Excepteur sint occaecat cupidatat nonproident.
            </p>
          </div>
        </div>
      </div>
    </section> -->

    <!-- Our Mission & Sustainability Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="font-['Poppins'] font-semibold text-3xl md:text-4xl text-gray-800 mb-8 leading-tight">
            {{ 'mission.title' | translate }}
          </h2>
          <p class="font-['DM_Sans'] text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {{ 'mission.subtitle' | translate }}
          </p>
        </div>

        <!-- Our Philosophy -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <!-- Image -->
          <div class="order-2 lg:order-1">
            <img
              src="assets/images/about_1.jpeg"
              alt="Sustainable Building"
              class="w-full h-96 lg:h-[500px] object-cover rounded-[40px]"
            >
          </div>
          
          <!-- Content -->
          <div class="order-1 lg:order-2">
            <h3 class="text-2xl lg:text-3xl font-bold text-[#222529] mb-8 font-['Poppins']">
              {{ 'mission.ourPhilosophy' | translate }}
            </h3>
            
            <div class="space-y-6">
              <!-- Environmental Responsibility -->
              <div class="bg-solar-50 rounded-2xl p-6 flex items-start gap-4">
                <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-solar-700 mb-2 font-['DM_Sans']">
                    {{ 'mission.environmentalResponsibility' | translate }}
                  </h4>
                  <p class="text-solar-600 font-['DM_Sans']">
                    {{ 'mission.environmentalText' | translate }}
                  </p>
                </div>
              </div>

              <!-- Quality and Durability -->
              <div class="bg-solar-50 rounded-2xl p-6 flex items-start gap-4">
                <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-solar-700 mb-2 font-['DM_Sans']">
                    {{ 'mission.qualityDurability' | translate }}
                  </h4>
                  <p class="text-solar-600 font-['DM_Sans']">
                    {{ 'mission.qualityText' | translate }}
                  </p>
                </div>
              </div>

              <!-- Technological Innovation -->
              <div class="bg-solar-50 rounded-2xl p-6 flex items-start gap-4">
                <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-solar-700 mb-2 font-['DM_Sans']">
                    {{ 'mission.technologicalInnovation' | translate }}
                  </h4>
                  <p class="text-solar-600 font-['DM_Sans']">
                    {{ 'mission.innovationText' | translate }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Our Commitment Beyond Product -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <!-- Content -->
          <div>
            <h3 class="text-2xl lg:text-3xl font-bold text-[#222529] mb-8 font-['Poppins']">
              {{ 'mission.commitmentBeyond' | translate }}
            </h3>
            
            <div class="space-y-6">
              <!-- Personalized Consulting -->
              <div class="flex items-start gap-4">
                <div class="w-6 h-6 flex-shrink-0 mt-1">
                  <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-solar-700 mb-2 font-['DM_Sans']">
                    {{ 'mission.personalizedConsulting' | translate }}
                  </h4>
                  <p class="text-solar-600 font-['DM_Sans']">
                    {{ 'mission.consultingText' | translate }}
                  </p>
                </div>
              </div>

              <!-- Continuous Updates and Research -->
              <div class="flex items-start gap-4">
                <div class="w-6 h-6 flex-shrink-0 mt-1">
                  <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-solar-700 mb-2 font-['DM_Sans']">
                    {{ 'mission.continuousUpdates' | translate }}
                  </h4>
                  <p class="text-solar-600 font-['DM_Sans']">
                    {{ 'mission.updatesText' | translate }}
                  </p>
                </div>
              </div>

              <!-- Awareness and Education -->
              <div class="flex items-start gap-4">
                <div class="w-6 h-6 flex-shrink-0 mt-1">
                  <svg class="w-6 h-6 text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-semibold text-solar-700 mb-2 font-['DM_Sans']">
                    {{ 'mission.awarenessEducation' | translate }}
                  </h4>
                  <p class="text-solar-600 font-['DM_Sans']">
                    {{ 'mission.educationText' | translate }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Image -->
          <div>
            <img
              src="assets/images/about_2.jpeg"
              alt="Sustainable Consulting"
              class="w-full h-96 lg:h-[500px] object-cover rounded-[40px]"
            >
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    
  `]
})
export class CompanyComponent {
} 