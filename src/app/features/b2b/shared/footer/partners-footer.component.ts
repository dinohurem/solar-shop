import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
    selector: 'app-partners-footer',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    template: `
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <!-- Company Info -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <img src="assets/images/logo.svg" alt="SolarShop" class="h-8 w-auto">
              <span class="px-2 py-1 bg-solar-600 text-white text-xs font-medium rounded-full">B2B</span>
            </div>
            <p class="text-gray-300 text-sm font-['DM_Sans']">
              {{ 'footer.description' | translate }}
            </p>
          </div>

          <!-- Partner Resources -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold font-['Poppins']">
              {{ 'b2bFooter.partnerResources' | translate }}
            </h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a routerLink="/partners/products" class="text-gray-300 hover:text-white transition-colors font-['DM_Sans']">
                  {{ 'b2bNav.products' | translate }}
                </a>
              </li>
              <li>
                <a routerLink="/partners/offers" class="text-gray-300 hover:text-white transition-colors font-['DM_Sans']">
                  {{ 'b2bNav.offers' | translate }}
                </a>
              </li>
              <li>
                <a routerLink="/partners/dashboard" class="text-gray-300 hover:text-white transition-colors font-['DM_Sans']">
                  {{ 'b2bFooter.dashboard' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold font-['Poppins']">
              {{ 'b2bFooter.support' | translate }}
            </h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a routerLink="/partners/contact" class="text-gray-300 hover:text-white transition-colors font-['DM_Sans']">
                  {{ 'b2bNav.contact' | translate }}
                </a>
              </li>
              <li>
                <a routerLink="/partners/about" class="text-gray-300 hover:text-white transition-colors font-['DM_Sans']">
                  {{ 'b2bNav.about' | translate }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Quick Access -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold font-['Poppins']">
              {{ 'b2bFooter.quickAccess' | translate }}
            </h3>
            <ul class="space-y-2 text-sm">
              <li>
                <a routerLink="/" class="text-gray-300 hover:text-white transition-colors font-['DM_Sans']">
                  {{ 'b2bFooter.backToB2C' | translate }}
                </a>
              </li>
              <li>
                <a routerLink="/partners/register" class="text-gray-300 hover:text-white transition-colors font-['DM_Sans']">
                  {{ 'b2bFooter.becomePartner' | translate }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="border-t border-gray-800 mt-12 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="text-sm text-gray-400 font-['DM_Sans']">
              {{ 'footer.copyright' | translate }} {{ currentYear }} SolarShop B2B. {{ 'footer.allRightsReserved' | translate }}
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class PartnersFooterComponent {
    currentYear = new Date().getFullYear();
} 