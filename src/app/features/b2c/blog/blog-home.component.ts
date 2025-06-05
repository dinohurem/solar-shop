import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-blog-home',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
    <!-- What You'll Find Section -->
    <section class="py-16 px-4 md:px-8 lg:px-32 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Left Column -->
          <div class="space-y-8">
            <h2 class="font-['Poppins'] font-semibold text-2xl text-gray-800 leading-tight">
              {{ 'blog.whatYouFind' | translate }}
            </h2>
            
            <div class="space-y-6">
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.technicalGuides' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.technicalGuidesText' | translate }}
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.regulationsInsights' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.regulationsText' | translate }}
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.sustainabilityTips' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.sustainabilityText' | translate }}
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.caseStudies' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.caseStudiesText' | translate }}
                </p>
              </div>
              
              <div class="space-y-2">
                <h3 class="font-['DM_Sans'] font-semibold text-lg text-gray-800">{{ 'blog.faqTutorials' | translate }}</h3>
                <p class="font-['DM_Sans'] text-base text-gray-600 leading-relaxed">
                  {{ 'blog.faqText' | translate }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Right Column -->
          <div class="space-y-8">
            <h2 class="font-['Poppins'] font-semibold text-2xl text-gray-800 leading-tight">
              {{ 'blog.trustedPartner' | translate }}
            </h2>
            
            <p class="font-['DM_Sans'] text-base text-gray-800 leading-relaxed">
              {{ 'blog.partnerText' | translate }}
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  `]
})
export class BlogHomeComponent {
} 