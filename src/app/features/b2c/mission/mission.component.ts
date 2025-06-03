import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <!-- Mission/Sustainability Page -->
    <div class="min-h-screen bg-white">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-[#0B8F5C] to-[#044741] py-20 lg:py-32">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
          <svg class="absolute top-20 left-20 w-40 h-40" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 L90 90 L10 90 Z" fill="white" opacity="0.1"/>
          </svg>
          <svg class="absolute bottom-20 right-20 w-32 h-32" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" fill="white" opacity="0.15"/>
          </svg>
        </div>
        
        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-['Poppins']">
            {{ 'mission.title' | translate }}
          </h1>
          <p class="text-xl lg:text-2xl text-white opacity-80 max-w-3xl mx-auto font-['DM_Sans']">
            {{ 'mission.subtitle' | translate }}
          </p>
        </div>
      </section>

      <!-- Our Philosophy Section -->
      <section class="py-16 lg:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Image -->
            <div class="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Sustainable Building" 
                class="w-full h-96 lg:h-[500px] object-cover rounded-[40px]"
              >
            </div>
            
            <!-- Content -->
            <div class="order-1 lg:order-2">
              <h2 class="text-3xl lg:text-4xl font-bold text-[#222529] mb-8 font-['Poppins']">
                {{ 'mission.ourPhilosophy' | translate }}
              </h2>
              
              <div class="space-y-6">
                <!-- Environmental Responsibility -->
                <div class="bg-[#F4FDF9] rounded-2xl p-6 flex items-start gap-4">
                  <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg class="w-4 h-4 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[#255241] mb-2 font-['DM_Sans']">
                      {{ 'mission.environmentalResponsibility' | translate }}
                    </h3>
                    <p class="text-[#4E7A69] font-['DM_Sans']">
                      {{ 'mission.environmentalText' | translate }}
                    </p>
                  </div>
                </div>

                <!-- Quality and Durability -->
                <div class="bg-[#F4FDF9] rounded-2xl p-6 flex items-start gap-4">
                  <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg class="w-4 h-4 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[#255241] mb-2 font-['DM_Sans']">
                      {{ 'mission.qualityDurability' | translate }}
                    </h3>
                    <p class="text-[#4E7A69] font-['DM_Sans']">
                      {{ 'mission.qualityText' | translate }}
                    </p>
                  </div>
                </div>

                <!-- Technological Innovation -->
                <div class="bg-[#F4FDF9] rounded-2xl p-6 flex items-start gap-4">
                  <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg class="w-4 h-4 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[#255241] mb-2 font-['DM_Sans']">
                      {{ 'mission.technologicalInnovation' | translate }}
                    </h3>
                    <p class="text-[#4E7A69] font-['DM_Sans']">
                      {{ 'mission.innovationText' | translate }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Our Commitment Beyond Product -->
      <section class="py-16 lg:py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Content -->
            <div>
              <h2 class="text-3xl lg:text-4xl font-bold text-[#222529] mb-8 font-['Poppins']">
                {{ 'mission.commitmentBeyond' | translate }}
              </h2>
              
              <div class="space-y-6">
                <!-- Personalized Consulting -->
                <div class="flex items-start gap-4">
                  <div class="w-6 h-6 flex-shrink-0 mt-1">
                    <svg class="w-6 h-6 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[#255241] mb-2 font-['DM_Sans']">
                      {{ 'mission.personalizedConsulting' | translate }}
                    </h3>
                    <p class="text-[#4E7A69] font-['DM_Sans']">
                      {{ 'mission.consultingText' | translate }}
                    </p>
                  </div>
                </div>

                <!-- Continuous Updates and Research -->
                <div class="flex items-start gap-4">
                  <div class="w-6 h-6 flex-shrink-0 mt-1">
                    <svg class="w-6 h-6 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[#255241] mb-2 font-['DM_Sans']">
                      {{ 'mission.continuousUpdates' | translate }}
                    </h3>
                    <p class="text-[#4E7A69] font-['DM_Sans']">
                      {{ 'mission.updatesText' | translate }}
                    </p>
                  </div>
                </div>

                <!-- Awareness and Education -->
                <div class="flex items-start gap-4">
                  <div class="w-6 h-6 flex-shrink-0 mt-1">
                    <svg class="w-6 h-6 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[#255241] mb-2 font-['DM_Sans']">
                      {{ 'mission.awarenessEducation' | translate }}
                    </h3>
                    <p class="text-[#4E7A69] font-['DM_Sans']">
                      {{ 'mission.educationText' | translate }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image -->
            <div>
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Sustainable Consulting" 
                class="w-full h-96 lg:h-[500px] object-cover rounded-[40px]"
              >
            </div>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="py-16 lg:py-24">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-xl lg:text-2xl text-[#222529] leading-relaxed font-['DM_Sans']">
            Together, we can build a future where comfort, quality, efficiency and respect for the environment go hand in hand. By choosing SolarShop, you choose to contribute to a healthier, more balanced and conscious world.
          </p>
        </div>
      </section>

      <!-- How We Select Materials -->
      <section class="py-16 lg:py-24 bg-[#FFFAF1]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-[#222529] mb-4 font-['Poppins']">
              {{ 'mission.materialSelection' | translate }}
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Raw Materials Analysis -->
            <div class="text-center">
              <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg class="w-6 h-6 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-[#222529] mb-4 font-['Poppins']">
                {{ 'mission.rawMaterialsAnalysis' | translate }}
              </h3>
              <p class="text-[#324053] font-['DM_Sans']">
                {{ 'mission.rawMaterialsText' | translate }}
              </p>
            </div>

            <!-- Certification Evaluation -->
            <div class="text-center">
              <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg class="w-6 h-6 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-[#222529] mb-4 font-['Poppins']">
                {{ 'mission.certificationEvaluation' | translate }}
              </h3>
              <p class="text-[#324053] font-['DM_Sans']">
                {{ 'mission.certificationText' | translate }}
              </p>
            </div>

            <!-- Energy Efficiency -->
            <div class="text-center">
              <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg class="w-6 h-6 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-[#222529] mb-4 font-['Poppins']">
                {{ 'mission.energyEfficiency' | translate }}
              </h3>
              <p class="text-[#324053] font-['DM_Sans']">
                {{ 'mission.efficiencyText' | translate }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="py-16 lg:py-24 bg-[#FCF5E0] relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute inset-0">
          <div class="absolute -top-10 -left-10 w-40 h-40 bg-[#FAF1D0] rounded-full opacity-50"></div>
          <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FAF1D0] rounded-full opacity-60"></div>
        </div>
        
        <div class="relative max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <!-- Newsletter Icon -->
          <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg class="w-6 h-6 text-[#0ACF83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          
          <h3 class="text-lg font-bold text-[#222529] mb-5 font-['Poppins']">
            {{ 'mission.subscribeNewsletter' | translate }}
          </h3>
          
          <div class="flex gap-2">
            <input 
              type="email" 
              placeholder="Email address"
              class="flex-1 px-4 py-3 border border-[#EEE8D0] rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#0ACF83] focus:border-transparent font-['DM_Sans'] placeholder-gray-400"
            >
            <button class="bg-[#0ACF83] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#09b574] transition-colors font-['DM_Sans']">
              {{ 'common.subscribe' | translate }}
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* Custom font loading */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
    
    :host {
      display: block;
    }
  `]
})
export class MissionComponent {
} 