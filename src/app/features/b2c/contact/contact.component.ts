import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <!-- Contact Page -->
    <div class="min-h-screen bg-white">
      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <!-- Content -->
        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div class="max-w-2xl">
            <h1 class="text-4xl lg:text-5xl font-bold font-['Poppins'] mb-6">
              Contacts & Assistance
            </h1>
            <p class="text-lg lg:text-xl leading-relaxed opacity-90 font-['DM_Sans']">
              Need help or want more information? We're here for you. The Contacts & Assistance section of SolarShop is designed to provide you with all the support you need, from product selection to post-sale, ensuring a simple, transparent and secure shopping experience.
            </p>
            
            <!-- Contact Info -->
            <div class="mt-8 space-y-4">
              <div class="flex items-center space-x-4">
                <div class="w-5 h-5 flex-shrink-0">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                                 <span class="font-['DM_Sans']">info&#64;heyhome.it</span>
              </div>
              <div class="flex items-center space-x-4">
                <div class="w-5 h-5 flex-shrink-0">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                </div>
                <span class="font-['DM_Sans']">+39 3456493134</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Form Section -->
      <section class="py-16 lg:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
            <div class="mb-8">
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 font-['Poppins'] mb-4">
                Contact Form
              </h2>
              <p class="text-gray-600 font-['DM_Sans']">
                Fill in the online form found on this page, entering your data and the nature of your request. A member of our staff will contact you shortly.
              </p>
            </div>

            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Name and Surname Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans'] uppercase tracking-wide">
                    Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    formControlName="firstName"
                    placeholder="Name"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-['DM_Sans']"
                  >
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans'] uppercase tracking-wide">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    formControlName="lastName"
                    placeholder="Last Name"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-['DM_Sans']"
                  >
                </div>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans'] uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  placeholder="Email"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-['DM_Sans']"
                >
              </div>

              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-900 mb-2 font-['DM_Sans'] uppercase tracking-wide">
                  Message
                </label>
                <textarea
                  id="message"
                  formControlName="message"
                  rows="6"
                  placeholder="Type your message here..."
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-['DM_Sans'] resize-none"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div>
                <button
                  type="submit"
                  [disabled]="contactForm.invalid || isSubmitting"
                  class="inline-flex items-center px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-['DM_Sans'] uppercase tracking-wide"
                >
                  <span *ngIf="!isSubmitting">Send message</span>
                  <span *ngIf="isSubmitting">Sending...</span>
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
                Post-Sale Assistance
              </h2>
              <p class="text-gray-600 font-['DM_Sans'] leading-relaxed">
                Once you've completed your purchase, we don't leave you alone. Have questions about the products you received, delivery times, or installation methods? Our post-sale assistance service is at your disposal to:
              </p>
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 flex-shrink-0 mt-0.5">
                    <svg class="w-full h-full text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600 font-['DM_Sans']">
                    Provide detailed information about the products you chose.
                  </p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 flex-shrink-0 mt-0.5">
                    <svg class="w-full h-full text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600 font-['DM_Sans']">
                    Guide you in installation or use of materials.
                  </p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 flex-shrink-0 mt-0.5">
                    <svg class="w-full h-full text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600 font-['DM_Sans']">
                    Help you with any issues, ensuring quick and effective solutions.
                  </p>
                </div>
              </div>
              <div class="pt-4">
                <button class="inline-flex items-center space-x-2 text-green-600 font-semibold hover:text-green-700 transition-colors font-['DM_Sans']">
                  <span>Learn more</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Technical Support & Showrooms -->
          <div class="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20 mb-20">
            <div class="w-full lg:w-1/2">
              <div class="aspect-[4/3] bg-gradient-to-br from-green-100 to-green-200 rounded-[40px] flex items-center justify-center">
                <div class="text-6xl text-green-600">🏢</div>
              </div>
            </div>
            <div class="w-full lg:w-1/2 space-y-6">
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 font-['Poppins']">
                Technical Support<br/>& Showroom
              </h2>
              <p class="text-gray-600 font-['DM_Sans'] leading-relaxed">
                If you want a more direct contact, or if your project requires specific technical support, you may visit one of our showrooms or assistance centers, where you can talk to our experts and see the products up close.
              </p>
              <div class="pt-4">
                <button class="inline-flex items-center space-x-2 text-green-600 font-semibold hover:text-green-700 transition-colors font-['DM_Sans']">
                  <span>View the nearest point</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Returns & Shipping Policy -->
          <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div class="w-full lg:w-1/2">
              <div class="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 rounded-[40px] flex items-center justify-center">
                <div class="text-6xl text-purple-600">📦</div>
              </div>
            </div>
            <div class="w-full lg:w-1/2 space-y-6">
              <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 font-['Poppins']">
                Returns & Shipping Policy
              </h2>
              <p class="text-gray-600 font-['DM_Sans'] leading-relaxed">
                Consult our section dedicated to Returns and Shipping Policy to learn about the return procedures, delivery times and conditions for any refunds. We are always transparent, so you can shop with confidence knowing that you can count on us in case of changes or issues.
              </p>
              <div class="pt-4">
                <button class="inline-flex items-center space-x-2 text-green-600 font-semibold hover:text-green-700 transition-colors font-['DM_Sans']">
                  <span>Learn more</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="py-16 lg:py-24 bg-gray-800 text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold font-['Poppins'] mb-8">FAQ</h2>
          </div>
          
          <div class="space-y-4">
            <div 
              *ngFor="let faq of faqs; trackBy: trackByFaqId"
              class="border-b border-gray-600 last:border-b-0"
            >
              <button
                (click)="toggleFaq(faq.id)"
                class="w-full flex items-center justify-between py-6 text-left hover:text-green-400 transition-colors"
              >
                <span class="text-lg lg:text-xl font-semibold font-['DM_Sans'] pr-4">{{ faq.question }}</span>
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
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom CTA -->
      <section class="py-16 lg:py-24 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-lg lg:text-xl text-gray-600 font-['DM_Sans'] leading-relaxed">
            Whatever your need, the SolarShop team is ready to help you. Contact us today and let us guide you towards the solution most suited to your needs. Building or renovating has never been easier, secure and satisfying.
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

  faqs: FAQItem[] = [
    {
      id: '1',
      question: 'What types of services does SolarShop offer?',
      answer: 'SolarShop offers a wide range of services, including energy audits, energy modeling, high-efficiency system installations, renewable energy integration, building envelope upgrades, mechanical system upgrades, electrical system upgrades, plumbing system upgrades, and comprehensive project management.',
      isOpen: false
    },
    {
      id: '2',
      question: 'Who are your services designed for?',
      answer: 'Our services are designed for homeowners, businesses, and contractors looking to improve energy efficiency, reduce costs, and implement sustainable building solutions.',
      isOpen: false
    },
    {
      id: '3',
      question: 'How can photovoltaic systems benefit me?',
      answer: 'Photovoltaic systems can significantly reduce your electricity bills, increase your property value, provide energy independence, and contribute to environmental sustainability by reducing your carbon footprint.',
      isOpen: false
    },
    {
      id: '4',
      question: 'What is a thermal jacket, and why is it important?',
      answer: 'A thermal jacket refers to building insulation that wraps around your home like a jacket, preventing heat loss in winter and heat gain in summer. This improves energy efficiency and comfort while reducing heating and cooling costs.',
      isOpen: false
    },
    {
      id: '5',
      question: 'Are your energy solutions environmentally friendly?',
      answer: 'Yes, all our energy solutions are designed with sustainability in mind. We focus on renewable energy sources, energy-efficient technologies, and environmentally responsible materials and practices.',
      isOpen: false
    },
    {
      id: '6',
      question: 'Can you manage complete renovations?',
      answer: 'Absolutely! We provide comprehensive project management for complete renovations, handling everything from initial planning and permits to final installation and quality assurance.',
      isOpen: false
    }
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      // Simulate form submission
      setTimeout(() => {
        console.log('Form submitted:', this.contactForm.value);
        this.isSubmitting = false;
        this.contactForm.reset();
        // In a real app, you would send this to your backend
      }, 2000);
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