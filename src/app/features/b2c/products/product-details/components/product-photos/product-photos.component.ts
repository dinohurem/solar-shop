import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
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
      <div class="aspect-square overflow-hidden rounded-lg bg-gray-100 relative">
        <img 
          [src]="selectedImage" 
          [alt]="product.name"
          class="w-full h-full object-cover cursor-zoom-in"
          (click)="openZoom()"
        >
      </div>

      <!-- Thumbnail Gallery -->
      <div class="grid grid-cols-4 gap-4">
        <button 
          *ngFor="let image of productImages; let i = index"
          (click)="selectImage(image)"
          class="aspect-square overflow-hidden rounded-lg bg-gray-100 border-2 transition-colors"
          [class.border-solar-600]="selectedImage === image"
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

    <!-- Zoom Modal -->
    <div 
      *ngIf="isZoomOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      (click)="closeZoom()"
      (keydown.escape)="closeZoom()"
    >
      <div class="relative max-w-4xl max-h-screen p-4">
        <!-- Close Button -->
        <button 
          (click)="closeZoom()"
          class="absolute top-2 right-2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Navigation Arrows -->
        <button 
          *ngIf="productImages.length > 1"
          (click)="previousImage(); $event.stopPropagation()"
          class="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <button 
          *ngIf="productImages.length > 1"
          (click)="nextImage(); $event.stopPropagation()"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Zoomed Image -->
        <img 
          [src]="selectedImage" 
          [alt]="product.name"
          class="max-w-full max-h-full object-contain"
          (click)="$event.stopPropagation()"
        >

        <!-- Image Counter in Modal -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
          {{ getCurrentImageIndex() + 1 }} / {{ productImages.length }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductPhotosComponent implements OnInit, OnDestroy {
  @Input() product!: Product;

  selectedImage: string = '';
  productImages: string[] = [];
  isZoomOpen: boolean = false;

  ngOnInit(): void {
    // Get images from product data
    this.extractProductImages();
    this.selectedImage = this.productImages[0];
  }

  private extractProductImages(): void {
    // Check if product has images array (new format)
    if (this.product.images && Array.isArray(this.product.images)) {
      this.productImages = this.product.images.map((img: any) => {
        // Handle both object format {url: string} and string format
        return typeof img === 'string' ? img : img.url || img;
      }).filter(url => url); // Filter out empty urls
    } 
    // Fallback to single imageUrl (legacy format)
    else if (this.product.imageUrl) {
      this.productImages = [this.product.imageUrl];
    } 
    // Default placeholder if no images
    else {
      this.productImages = ['assets/images/product-placeholder.jpg'];
    }
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  getCurrentImageIndex(): number {
    return this.productImages.indexOf(this.selectedImage);
  }

  openZoom(): void {
    this.isZoomOpen = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeZoom(): void {
    this.isZoomOpen = false;
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  nextImage(): void {
    const currentIndex = this.getCurrentImageIndex();
    const nextIndex = (currentIndex + 1) % this.productImages.length;
    this.selectedImage = this.productImages[nextIndex];
  }

  previousImage(): void {
    const currentIndex = this.getCurrentImageIndex();
    const prevIndex = currentIndex === 0 ? this.productImages.length - 1 : currentIndex - 1;
    this.selectedImage = this.productImages[prevIndex];
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.isZoomOpen) return;

    switch (event.key) {
      case 'Escape':
        this.closeZoom();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousImage();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextImage();
        break;
    }
  }

  ngOnDestroy(): void {
    // Ensure body scroll is restored if component is destroyed while zoom is open
    if (this.isZoomOpen) {
      document.body.style.overflow = 'auto';
    }
  }
} 