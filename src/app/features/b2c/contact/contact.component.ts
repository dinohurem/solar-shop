import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../services/supabase.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
}

interface ShopLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  phoneLink: string;
  email?: string;
  workingHours: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <!-- Contact Page -->
    <div class="min-h-screen bg-white">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-solar-600 to-solar-800 text-white py-20 px-4 md:px-8 lg:px-32">
        <div class="max-w-6xl mx-auto text-center">
          <h1 class="font-['Poppins'] font-semibold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            {{ 'contactSupport.title' | translate }}
          </h1>
          <p class="font-['DM_Sans'] text-base md:text-lg max-w-4xl mx-auto opacity-80 leading-relaxed">
            {{ 'contactSupport.subtitle' | translate }}
          </p>
          
          <!-- Contact Info -->
          <div class="mt-8 flex justify-center space-x-8">
            <a href="mailto:prodaja1@solarni-paneli.hr" class="flex items-center space-x-4 hover:text-solar-200 transition-colors duration-200">
              <div class="w-5 h-5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
              <span class="font-['DM_Sans']">prodaja1&#64;solarni-paneli.hr</span>
            </a>
            <a href="tel:+38516407715" class="flex items-center space-x-4 hover:text-solar-200 transition-colors duration-200">
              <div class="w-5 h-5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </div>
              <span class="font-['DM_Sans']">+385 1 6407 715</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Contact Form Section -->
      <section class="py-16 lg:py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
            <div class="mb-8">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 font-['Poppins'] mb-4">
                {{ 'contactSupport.contactForm' | translate }}
              </h2>
              <p class="text-gray-600 font-['DM_Sans']">
                {{ 'contactSupport.contactFormText' | translate }}
              </p>
              <div *ngIf="messageSent" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-sm text-green-800 font-['DM_Sans']">{{ 'contactSupport.messageSent' | translate }}</p>
              </div>
            </div>

            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Name and Surname Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans'] uppercase tracking-wide">
                    {{ 'contactSupport.name' | translate }}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    formControlName="firstName"
                    [placeholder]="'contactSupport.name' | translate"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-colors font-['DM_Sans']"
                  >
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans'] uppercase tracking-wide">
                    {{ 'contactSupport.lastName' | translate }}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    formControlName="lastName"
                    [placeholder]="'contactSupport.lastName' | translate"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-colors font-['DM_Sans']"
                  >
                </div>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans'] uppercase tracking-wide">
                  {{ 'contactSupport.email' | translate }}
                </label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  [placeholder]="'contactSupport.email' | translate"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-colors font-['DM_Sans']"
                >
              </div>

              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans'] uppercase tracking-wide">
                  {{ 'contactSupport.message' | translate }}
                </label>
                <textarea
                  id="message"
                  formControlName="message"
                  rows="6"
                  [placeholder]="'contactSupport.typeMessage' | translate"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-solar-500 focus:border-solar-500 transition-colors font-['DM_Sans'] resize-none"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div>
                <button
                  type="submit"
                  [disabled]="contactForm.invalid || isSubmitting"
                  class="inline-flex items-center px-8 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 focus:ring-2 focus:ring-solar-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-['DM_Sans'] uppercase tracking-wide"
                >
                  <span *ngIf="!isSubmitting">{{ 'contactSupport.sendMessage' | translate }}</span>
                  <span *ngIf="isSubmitting">{{ 'contactSupport.sending' | translate }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- Locations Section -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 font-['Poppins']">{{ 'contactSupport.locationsTitle' | translate }}</h2>
            <p class="mt-3 text-gray-600 font-['DM_Sans']">{{ 'contactSupport.locationsSubtitle' | translate }}</p>
          </div>

          <div class="grid gap-8 md:grid-cols-2">
            <div *ngFor="let location of locations" class="bg-gray-50 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div class="relative h-64 bg-gray-100">
                <iframe
                  [src]="getMapEmbedUrl(location)"
                  class="w-full h-full"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  style="border:0;"
                  [title]="location.name + ' - Map'"
                  allowfullscreen>
                </iframe>
                <!-- Overlay marker indicator -->
                <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div class="w-8 h-8 -mt-8">
                    <svg viewBox="0 0 24 24" fill="none" class="w-full h-full drop-shadow-lg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444"/>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#991B1B" stroke-width="1"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900 font-['Poppins']">{{ location.name }}</h3>
                  <p class="text-gray-600 font-['DM_Sans']">{{ location.address }}</p>
                  <p class="text-gray-600 font-['DM_Sans']">
                    <span class="font-medium">{{ 'contactSupport.workingHours' | translate }}:</span>
                    {{ location.workingHours }}
                  </p>
                </div>

                <div class="pt-2 space-y-2">
                  <a
                    [href]="getPhoneHref(location)"
                    class="flex items-center space-x-2 text-solar-600 hover:text-solar-700 font-medium font-['DM_Sans']"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2 4.5A2.25 2.25 0 014.25 2h1.372c.51 0 .954.343 1.087.835l1.105 4.104a1.125 1.125 0 01-.417 1.2l-1.152.864a1.125 1.125 0 00-.417 1.2c.78 2.885 3.054 5.16 5.939 5.939a1.125 1.125 0 001.2-.417l.864-1.152a1.125 1.125 0 011.2-.417l4.104 1.105c.492.133.835.577.835 1.087V19.5A2.25 2.25 0 0119.5 21.75h-1.125C9.988 21.75 2.25 14.012 2.25 4.125V3.75A1.75 1.75 0 012 4.5z" />
                    </svg>
                    <span>{{ location.phone }}</span>
                  </a>
                  <a
                    *ngIf="location.email"
                    [href]="'mailto:' + location.email"
                    class="flex items-center space-x-2 text-solar-600 hover:text-solar-700 font-medium font-['DM_Sans']"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                    </svg>
                    <span>{{ location.email }}</span>
                  </a>
                  <a
                    [href]="getMapLink(location)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center space-x-2 text-solar-600 hover:text-solar-700 font-medium font-['DM_Sans']"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21c-4.5-4.364-7.5-7.795-7.5-11.25a7.5 7.5 0 1115 0C19.5 13.205 16.5 16.636 12 21z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11.25a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z" />
                    </svg>
                    <span>{{ 'contactSupport.viewOnMap' | translate }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <!-- Support Sections -->
      <section class="py-16 lg:py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Post-Sale Support -->
          <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-20">
            <div class="w-full lg:w-1/2">
              <div class="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 rounded-[40px] flex items-center justify-center">
                <div class="text-6xl text-blue-600">📞</div>
              </div>
            </div>
            <div class="w-full lg:w-1/2 space-y-6">
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 font-['Poppins'] uppercase">
                {{ 'contactSupport.postSaleAssistance' | translate }}
              </h2>
              <p class="text-gray-600 font-['DM_Sans'] leading-relaxed">
                {{ 'contactSupport.postSaleAssistanceText' | translate }}
              </p>
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 flex-shrink-0 mt-0.5">
                    <svg class="w-full h-full text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600 font-['DM_Sans']">
                    {{ 'contactSupport.detailedProductInfo' | translate }}
                  </p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 flex-shrink-0 mt-0.5">
                    <svg class="w-full h-full text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600 font-['DM_Sans']">
                    {{ 'contactSupport.installationGuidance' | translate }}
                  </p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 flex-shrink-0 mt-0.5">
                    <svg class="w-full h-full text-solar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600 font-['DM_Sans']">
                    {{ 'contactSupport.issueResolution' | translate }}
                  </p>
                </div>
              </div>
              <div class="pt-4">
              </div>
            </div>
          </div>

          <!-- Technical Support & Showrooms -->
          <div class="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20 mb-20">
            <div class="w-full lg:w-1/2">
              <div class="aspect-[4/3] bg-gradient-to-br from-solar-100 to-solar-200 rounded-[40px] flex items-center justify-center">
                <div class="text-6xl text-solar-600">🏢</div>
              </div>
            </div>
            <div class="w-full lg:w-1/2 space-y-6">
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 font-['Poppins']">
                {{ 'contactSupport.technicalSupport' | translate }}
              </h2>
              <p class="text-gray-600 font-['DM_Sans'] leading-relaxed">
                {{ 'contactSupport.technicalSupportText' | translate }}
              </p>
            </div>
          </div>

          <!-- Returns & Shipping Policy -->
          <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div class="w-full lg:w-1/2">
              <div class="aspect-[4/3] bg-gradient-to-br from-accent-100 to-accent-200 rounded-[40px] flex items-center justify-center">
                <div class="text-6xl text-accent-600">📦</div>
              </div>
            </div>
            <div class="w-full lg:w-1/2 space-y-6">
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 font-['Poppins']">
                {{ 'contactSupport.returnsShipping' | translate }}
              </h2>
              <p class="text-gray-600 font-['DM_Sans'] leading-relaxed">
                {{ 'contactSupport.returnsShippingText' | translate }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="py-16 lg:py-24 bg-gray-800 text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold font-['Poppins'] mb-8">{{ 'contactSupport.faq' | translate }}</h2>
          </div>
          
          <div class="space-y-4">
            <div 
              *ngFor="let faq of faqs; trackBy: trackByFaqId"
              class="border-b border-gray-600 last:border-b-0"
            >
              <button
                (click)="toggleFaq(faq.id)"
                class="w-full flex items-center justify-between py-6 text-left hover:text-solar-400 transition-colors"
              >
                <span class="text-lg lg:text-xl font-semibold font-['DM_Sans'] pr-4">{{ faq.question | translate }}</span>
                <div class="flex-shrink-0 w-6 h-6">
                  <svg 
                    class="w-full h-full transform transition-transform"
                    [class.rotate-45]="faq.isOpen"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
              </button>
              <div 
                *ngIf="faq.isOpen"
                class="pb-6 text-gray-300 font-['DM_Sans'] leading-relaxed"
              >
                {{ faq.answer | translate }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="py-16 lg:py-24 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-lg lg:text-xl text-gray-600 font-['DM_Sans'] leading-relaxed">
            {{ 'contactSupport.bottomCta' | translate }}
          </p>
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
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  messageSent = false;
  constructor(private fb: FormBuilder, private supabase: SupabaseService, private sanitizer: DomSanitizer) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  locations: ShopLocation[] = [
    {
      id: 'outlet',
      name: 'SolarShop OUTLET',
      address: 'Bani 73, Buzin, Zagreb',
      phone: '+385 1 6407 715',
      phoneLink: '+38516407715',
      email: 'prodaja1@solarni-paneli.hr',
      workingHours: 'PON-PET 08-16',
      latitude: 45.7517,
      longitude: 16.0069
    },
    {
      id: 'vela-luka',
      name: 'SolarShop VELA LUKA',
      address: 'Ulica 41 broj 15, 20270 Vela Luka',
      phone: '+385 20 813 218',
      phoneLink: '+38520813218',
      email: 'steu-piccolo@post.t-com.hr',
      workingHours: 'PON-PET 08-12, 17-19:30',
      latitude: 42.9608,
      longitude: 16.7206
    },
    {
      id: 'vinkovci',
      name: 'SolarShop VINKOVCI',
      address: 'Ul. B. J. Jelačića 11, 32100 Vinkovci',
      phone: '+385 32 778 741',
      phoneLink: '+38532778741',
      email: 'vinkovci@solarno.hr',
      workingHours: 'PON-PET 9-17',
      latitude: 45.2883,
      longitude: 18.8047
    },
    {
      id: 'jastrebarsko',
      name: 'SolarShop JASTREBARSKO',
      address: 'Ul. Franje Tuđmana 28, 10450 Jastrebarsko',
      phone: '+385 1 2135 241',
      phoneLink: '+38512135241',
      email: 'jastrebarsko@solarno.hr',
      workingHours: 'PON, UTO, ČET 8-16 | SRI, PET 8-12/16-18 | SUB 8-12',
      latitude: 45.6688,
      longitude: 15.6511
    },
    {
      id: 'pozega',
      name: 'SolarShop POŽEGA',
      address: 'Zrinska 65, 34000 Požega',
      phone: '+385 34 550 650',
      phoneLink: '+38534550650',
      email: 'pozega@solarno.hr',
      workingHours: 'PON-PET 9-16 | SUBOTA 8-13',
      latitude: 45.3403,
      longitude: 17.6852
    },
    {
      id: 'vukovarska',
      name: 'SolarShop Zagreb - Vukovarska',
      address: 'Vukovarska 226G (kod Strojarske)',
      phone: '+385 1 7791 210',
      phoneLink: '+38517791210',
      email: 'solarshop@solarno.hr',
      workingHours: 'PON-PET 09-18 | SUBOTA 09-12',
      latitude: 45.8047,
      longitude: 15.9087
    },
    {
      id: 'rijeka',
      name: 'SolarShop RIJEKA',
      address: 'Mavrinci 34, Kukuljanovo (skretanje za Mavrince prije Vulkala)',
      phone: '+385 51 215 437',
      phoneLink: '+38551215437',
      email: 'rijeka@solarno.hr',
      workingHours: 'PON-PET 8-19',
      latitude: 45.3753,
      longitude: 14.4615
    },
    {
      id: 'zagreb-centar',
      name: 'SolarShop Zagreb',
      address: 'Julija Knifera 2 Središće (preko puta Muzeja Suv.Umj.)',
      phone: '+385 1 6521 634',
      phoneLink: '+38516521634',
      email: 'info@solarno.hr',
      workingHours: 'PON-PET 09-17 | SUBOTA 09-12',
      latitude: 45.8276,
      longitude: 15.9969
    },
    {
      id: 'sesvete',
      name: 'SolarShop SESVETE CENTAR PEĆI I KAMINA',
      address: 'Sesvetska cesta 100 (stara Dugoselska)',
      phone: '+385 1 2316 240',
      phoneLink: '+38512316240',
      email: 'zagreb@solarno.hr',
      workingHours: 'PON-PET 09-16 | SUBOTA 09-12',
      latitude: 45.8311,
      longitude: 16.1161
    },
    {
      id: 'velika-gorica',
      name: 'SolarShop VELIKA GORICA',
      address: 'Ul. Slavka Kolara 101, V. GORICA',
      phone: '+385 91 723 6136',
      phoneLink: '+38591723616',
      email: 'info@agramsolar.hr',
      workingHours: 'PON-PET 08-17 | SUB 8-12',
      latitude: 45.7125,
      longitude: 16.0753
    },
    {
      id: 'dubrovnik',
      name: 'SolarShop DUBROVNIK',
      address: 'Ćira Carića 1, Babin kuk, Dubrovnik',
      phone: '+385 20 311 081',
      phoneLink: '+38520311081',
      email: 'solarshop@ragusa-solar.hr',
      workingHours: 'PON-PET 8-16 | SUBOTA zatvoreno',
      latitude: 42.6507,
      longitude: 18.0944
    },
    {
      id: 'split',
      name: 'SolarShop SPLIT',
      address: 'Lovački put 1A, Split',
      phone: '+385 21 374 865',
      phoneLink: '+38521374865',
      email: 'split@solarno.hr',
      workingHours: 'PON-PET 8-19 | SUBOTA 8-12',
      latitude: 43.5147,
      longitude: 16.4435
    },
    {
      id: 'sibenik',
      name: 'SolarShop ŠIBENIK',
      address: 'Gavranova 11c, Šibenik',
      phone: '+385 22 642 221',
      phoneLink: '+38522642221',
      email: 'sibenik@solarno.hr',
      workingHours: 'PON-PET 09-17 | SUBOTA 09-12',
      latitude: 43.7234,
      longitude: 15.9059
    },
    {
      id: 'zadar',
      name: 'SolarShop ZADAR',
      address: 'Vlatka Mačeka 26, Zadar',
      phone: '+385 23 390 436',
      phoneLink: '+38523390436',
      email: 'zadar@solarno.hr',
      workingHours: 'UTO, SRI, PET 08-16 | PON, ČET 10-18',
      latitude: 44.1194,
      longitude: 15.2314
    },
    {
      id: 'pula',
      name: 'SolarShop PULA',
      address: 'Medulinska cesta 28C, Pula',
      phone: '+385 52 212 386',
      phoneLink: '+38552212386',
      email: 'pula@solarno.hr',
      workingHours: 'PON-PET 08:30-19 | SUBOTA 08:30-13',
      latitude: 44.8666,
      longitude: 13.8496
    },
    {
      id: 'osijek',
      name: 'SolarShop OSIJEK',
      address: 'Strosmajerova 296, Osijek',
      phone: '+385 31 629 190',
      phoneLink: '+38531629190',
      email: 'info@luminous.hr',
      workingHours: 'PON-PET 09-16 | SUB 09-12',
      latitude: 45.5550,
      longitude: 18.6955
    },
    {
      id: 'varazdin',
      name: 'SolarShop VARAŽDIN',
      address: 'Hercegovačka ul.1, Varaždin',
      phone: '+385 42 303 858',
      phoneLink: '+38542303858',
      email: 'varazdin@beren.hr',
      workingHours: 'PON-PET 08-20 | SUBOTA 08-13',
      latitude: 46.3044,
      longitude: 16.3378
    },
    {
      id: 'posusje',
      name: 'SolarShop POSUŠJE',
      address: 'Put za Imotski bb, 88240 Posušje',
      phone: '+387 39 682 493',
      phoneLink: '+38739682493',
      email: 'info@energo-shop.ba',
      workingHours: 'PON-PET 8-15 | SUB 8-12',
      latitude: 43.4666,
      longitude: 17.3275
    },
    {
      id: 'ljubljana',
      name: 'SolarShop LJUBLJANA',
      address: 'Ukmarjeva ulica 6, 1000 Ljubljana, Slovenija',
      phone: '+386 1 292 66 56',
      phoneLink: '+38612926656',
      email: 'info@soncnelektrarne.si',
      workingHours: 'PON-PET 8-16',
      latitude: 46.0569,
      longitude: 14.5058
    }
  ];

  faqs: FAQItem[] = [
    {
      id: '1',
      question: 'contactSupport.faqQuestion1',
      answer: 'contactSupport.faqAnswer1',
      isOpen: false
    },
    {
      id: '2',
      question: 'contactSupport.faqQuestion2',
      answer: 'contactSupport.faqAnswer2',
      isOpen: false
    },
    {
      id: '3',
      question: 'contactSupport.faqQuestion3',
      answer: 'contactSupport.faqAnswer3',
      isOpen: false
    },
    {
      id: '4',
      question: 'contactSupport.faqQuestion4',
      answer: 'contactSupport.faqAnswer4',
      isOpen: false
    },
    {
      id: '5',
      question: 'contactSupport.faqQuestion5',
      answer: 'contactSupport.faqAnswer5',
      isOpen: false
    },
    {
      id: '6',
      question: 'contactSupport.faqQuestion6',
      answer: 'contactSupport.faqAnswer6',
      isOpen: false
    }
  ];



  ngOnInit(): void {
    // Component initialization
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const formValue = this.contactForm.value;
      this.supabase.createRecord('contacts', {
        first_name: formValue.firstName,
        last_name: formValue.lastName,
        email: formValue.email,
        message: formValue.message,
        is_newsletter: false
      }).then(() => {
        this.isSubmitting = false;
        this.messageSent = true;
        this.contactForm.reset();
        setTimeout(() => { this.messageSent = false; }, 5000);
      }).catch(error => {
        console.error('Error sending contact form:', error);
        this.isSubmitting = false;
        alert('Error sending message');
      });
    }
  }

  toggleFaq(faqId: string): void {
    const faq = this.faqs.find(f => f.id === faqId);
    if (faq) {
      faq.isOpen = !faq.isOpen;
    }
  }

  trackByFaqId(index: number, faq: FAQItem): string {
    return faq.id;
  }

  getMapEmbedUrl(location: ShopLocation): SafeResourceUrl {
    // Using OpenStreetMap with marker - zoom level 16 for good detail
    const zoom = 16;
    // The marker parameter ensures a red pin is displayed at the location
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.003}%2C${location.latitude-0.003}%2C${location.longitude+0.003}%2C${location.latitude+0.003}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getMapLink(location: ShopLocation): string {
    return `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`;
  }

  getPhoneHref(location: ShopLocation): string {
    return `tel:${location.phoneLink}`;
  }
}