import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../product-list/product-list.component';
import { TranslatePipe } from '../../../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-product-photos',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-4">
      <!-- Main Image -->
      <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img 
          [src]="selectedImage" 
          [alt]="product.name"
          class="w-full h-full object-cover"
        >
      </div>

      <!-- Thumbnail Gallery -->
      <div class="grid grid-cols-4 gap-4">
        <button 
          *ngFor="let image of productImages; let i = index"
          (click)="selectImage(image)"
          class="aspect-square overflow-hidden rounded-lg bg-gray-100 border-2 transition-colors"
          [class.border-[#0ACF83]]="selectedImage === image"
          [class.border-gray-200]="selectedImage !== image"
        >
          <img 
            [src]="image" 
            [alt]="product.name + ' - Image ' + (i + 1)"
            class="w-full h-full object-cover"
          >
        </button>
      </div>

      <!-- Image Counter -->
      <div class="text-center text-sm text-gray-500 font-['DM_Sans']">
        {{ getCurrentImageIndex() + 1 }} / {{ productImages.length }}
      </div>

      <!-- Zoom Button -->
      <button 
        (click)="openZoom()"
        class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-['DM_Sans']"
      >
        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
        </svg>
        {{ 'productDetails.zoomImage' | translate }}
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductPhotosComponent implements OnInit {
  @Input() product!: Product;

  selectedImage: string = '';
  productImages: string[] = [];

  ngOnInit(): void {
    // Generate multiple images for the product (in a real app, these would come from the product data)
    this.productImages = [
      this.product.imageUrl,
      this.product.imageUrl.replace('w=500&h=500', 'w=500&h=500&sat=-100'), // B&W version
      this.product.imageUrl.replace('w=500&h=500', 'w=500&h=500&sepia=100'), // Sepia version
      this.product.imageUrl.replace('w=500&h=500', 'w=500&h=500&hue=180'), // Hue shifted version
    ];
    this.selectedImage = this.productImages[0];
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getCurrentImageIndex(): number {
    return this.productImages.indexOf(this.selectedImage);
  }

  openZoom(): void {
    // TODO: Implement image zoom functionality
    console.log('Open zoom for image:', this.selectedImage);
  }
} 