import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { SupabaseService } from '../../../services/supabase.service';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
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
            <a href="mailto:info@solarni-paneli.hr" class="flex items-center space-x-4 hover:text-solar-200 transition-colors duration-200">
              <div class="w-5 h-5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
              <span class="font-['DM_Sans']">info&#64;solarni-paneli.hr</span>
            </a>
            <a href="tel:+385 (1) 6407 715" class="flex items-center space-x-4 hover:text-solar-200 transition-colors duration-200">
              <div class="w-5 h-5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </div>
              <span class="font-['DM_Sans']">+385 (1) 6407 715</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Contact Form Section -->
      <section class="py-16 lg:py-24">
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
  constructor(private fb: FormBuilder, private supabase: SupabaseService) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

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
} 