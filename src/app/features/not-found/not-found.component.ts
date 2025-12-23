import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-solar-50 flex items-center justify-center px-4 py-16">
      <div class="max-w-lg w-full text-center">
        <!-- 404 Illustration -->
        <div class="mb-8">
          <div class="relative">
            <svg class="w-64 h-64 mx-auto text-solar-500" fill="none" viewBox="0 0 200 200">
              <!-- Sun -->
              <circle cx="100" cy="80" r="30" fill="currentColor" opacity="0.2"/>
              <circle cx="100" cy="80" r="20" fill="currentColor"/>
              <!-- Sun rays -->
              <g stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <line x1="100" y1="40" x2="100" y2="30"/>
                <line x1="100" y1="120" x2="100" y2="130"/>
                <line x1="60" y1="80" x2="50" y2="80"/>
                <line x1="140" y1="80" x2="150" y2="80"/>
                <line x1="72" y1="52" x2="65" y2="45"/>
                <line x1="128" y1="52" x2="135" y2="45"/>
                <line x1="72" y1="108" x2="65" y2="115"/>
                <line x1="128" y1="108" x2="135" y2="115"/>
              </g>
              <!-- Solar panel (broken/tilted) -->
              <g transform="rotate(-15, 100, 160)">
                <rect x="50" y="140" width="100" height="60" rx="4" fill="#1e3a5f" stroke="currentColor" stroke-width="2"/>
                <line x1="50" y1="160" x2="150" y2="160" stroke="#3b82f6" stroke-width="1"/>
                <line x1="50" y1="180" x2="150" y2="180" stroke="#3b82f6" stroke-width="1"/>
                <line x1="75" y1="140" x2="75" y2="200" stroke="#3b82f6" stroke-width="1"/>
                <line x1="100" y1="140" x2="100" y2="200" stroke="#3b82f6" stroke-width="1"/>
                <line x1="125" y1="140" x2="125" y2="200" stroke="#3b82f6" stroke-width="1"/>
              </g>
              <!-- Disconnected cable -->
              <path d="M155 175 Q170 175 170 190 Q170 205 155 205" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
              <circle cx="155" cy="205" r="4" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <!-- Error Code -->
        <h1 class="text-8xl font-bold text-solar-600 font-['Poppins'] mb-4">404</h1>

        <!-- Error Message -->
        <h2 class="text-2xl font-semibold text-gray-900 font-['Poppins'] mb-4">
          {{ 'notFound.title' | translate }}
        </h2>
        <p class="text-gray-600 font-['DM_Sans'] mb-8">
          {{ 'notFound.description' | translate }}
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            routerLink="/"
            class="inline-flex items-center justify-center px-6 py-3 bg-solar-600 text-white font-semibold rounded-lg hover:bg-solar-700 transition-colors font-['DM_Sans']">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            {{ 'notFound.backHome' | translate }}
          </a>
          <a
            routerLink="/proizvodi"
            class="inline-flex items-center justify-center px-6 py-3 border-2 border-solar-600 text-solar-600 font-semibold rounded-lg hover:bg-solar-50 transition-colors font-['DM_Sans']">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            {{ 'notFound.browseProducts' | translate }}
          </a>
        </div>

        <!-- Contact Info -->
        <p class="mt-8 text-sm text-gray-500 font-['DM_Sans']">
          {{ 'notFound.needHelp' | translate }}
          <a routerLink="/kontakt" class="text-solar-600 hover:underline">{{ 'notFound.contactUs' | translate }}</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    
  `]
})
export class NotFoundComponent {}
