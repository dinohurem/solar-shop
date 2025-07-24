import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        
        <h1 class="text-3xl font-bold text-green-900 mb-4 font-['Poppins']">
          {{ 'orderConfirmation.title' | translate }}
        </h1>
        
        <p class="text-gray-600 mb-6 font-['DM_Sans']">
          {{ 'orderConfirmation.description' | translate }}
        </p>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6" *ngIf="orderNumber">
          <p class="text-sm text-green-800 font-['DM_Sans']">
            <span class="font-medium">{{ 'orderConfirmation.orderNumber' | translate }}:</span> {{ orderNumber }}
          </p>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-blue-800 font-['DM_Sans']">
            {{ 'orderConfirmation.emailSent' | translate }}
          </p>
        </div>
        
        <div class="space-y-3">
          <button 
            (click)="goToHome()"
            class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold font-['DM_Sans']"
          >
            {{ 'orderConfirmation.continueShopping' | translate }}
          </button>
          
          <button 
            (click)="goToProfile()"
            class="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium font-['DM_Sans']"
          >
            {{ 'orderConfirmation.viewOrders' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderNumber: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderNumber = params['orderNumber'] || '';
    });
  }

  goToHome(): void {
    this.router.navigate(['/proizvodi']);
  }

  goToProfile(): void {
    this.router.navigate(['/profil']);
  }
}