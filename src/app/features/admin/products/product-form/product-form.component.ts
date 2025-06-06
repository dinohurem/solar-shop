import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';

interface Product {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    compare_at_price?: number;
    sku: string;
    category_id?: string;
    images?: string[];
    specifications?: any;
    is_active: boolean;
    is_featured: boolean;
    is_on_sale: boolean;
    stock_quantity: number;
    weight?: number;
    dimensions?: any;
    created_at?: string;
    updated_at?: string;
}

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AdminFormComponent],
    template: `
    <app-admin-form
      [title]="isEditMode ? 'Edit Product' : 'Create Product'"
      [subtitle]="isEditMode ? 'Update product information' : 'Add a new product to your catalog'"
      [form]="productForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/products'"
      (formSubmit)="onSubmit($event)"
    >
      <!-- Product Basic Info -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Product Name *</label>
          <input
            type="text"
            id="name"
            formControlName="name"
            (input)="onNameChange($event)"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="Enter product name"
          >
          <div *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched" class="mt-1 text-sm text-red-600">
            Product name is required
          </div>
        </div>

        <div>
          <label for="slug" class="block text-sm font-medium text-gray-700">URL Slug *</label>
          <input
            type="text"
            id="slug"
            formControlName="slug"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="product-url-slug"
          >
          <div *ngIf="productForm.get('slug')?.invalid && productForm.get('slug')?.touched" class="mt-1 text-sm text-red-600">
            URL slug is required
          </div>
        </div>
      </div>

      <!-- SKU and Category -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label for="sku" class="block text-sm font-medium text-gray-700">SKU *</label>
          <input
            type="text"
            id="sku"
            formControlName="sku"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="PROD-001"
          >
          <div *ngIf="productForm.get('sku')?.invalid && productForm.get('sku')?.touched" class="mt-1 text-sm text-red-600">
            SKU is required
          </div>
        </div>

        <div>
          <label for="category_id" class="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category_id"
            formControlName="category_id"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            <option *ngFor="let category of categories" [value]="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          formControlName="description"
          rows="4"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
          placeholder="Enter product description"
        ></textarea>
      </div>

      <!-- Pricing -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">Price *</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">€</span>
            </div>
            <input
              type="number"
              id="price"
              formControlName="price"
              step="0.01"
              min="0"
              class="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="0.00"
            >
          </div>
          <div *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched" class="mt-1 text-sm text-red-600">
            Price is required and must be greater than 0
          </div>
        </div>

        <div>
          <label for="compare_at_price" class="block text-sm font-medium text-gray-700">Compare at Price</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">€</span>
            </div>
            <input
              type="number"
              id="compare_at_price"
              formControlName="compare_at_price"
              step="0.01"
              min="0"
              class="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="0.00"
            >
          </div>
        </div>
      </div>

      <!-- Stock and Weight -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label for="stock_quantity" class="block text-sm font-medium text-gray-700">Stock Quantity *</label>
          <input
            type="number"
            id="stock_quantity"
            formControlName="stock_quantity"
            min="0"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="0"
          >
          <div *ngIf="productForm.get('stock_quantity')?.invalid && productForm.get('stock_quantity')?.touched" class="mt-1 text-sm text-red-600">
            Stock quantity is required
          </div>
        </div>

        <div>
          <label for="weight" class="block text-sm font-medium text-gray-700">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            formControlName="weight"
            step="0.1"
            min="0"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="0.0"
          >
        </div>
      </div>

      <!-- Product Status -->
      <div class="space-y-4">
        <h4 class="text-lg font-medium text-gray-900">Product Status</h4>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div class="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              formControlName="is_active"
              class="focus:ring-solar-500 h-4 w-4 text-solar-600 border-gray-300 rounded"
            >
            <label for="is_active" class="ml-2 text-sm font-medium text-gray-700">Active</label>
          </div>

          <div class="flex items-center">
            <input
              id="is_featured"
              type="checkbox"
              formControlName="is_featured"
              class="focus:ring-solar-500 h-4 w-4 text-solar-600 border-gray-300 rounded"
            >
            <label for="is_featured" class="ml-2 text-sm font-medium text-gray-700">Featured</label>
          </div>

          <div class="flex items-center">
            <input
              id="is_on_sale"
              type="checkbox"
              formControlName="is_on_sale"
              class="focus:ring-solar-500 h-4 w-4 text-solar-600 border-gray-300 rounded"
            >
            <label for="is_on_sale" class="ml-2 text-sm font-medium text-gray-700">On Sale</label>
          </div>
        </div>
      </div>

      <!-- Images -->
      <div>
        <label for="images" class="block text-sm font-medium text-gray-700">Product Images</label>
        <textarea
          id="images"
          formControlName="images"
          rows="3"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
          placeholder="Enter image URLs, one per line"
        ></textarea>
        <p class="mt-2 text-sm text-gray-500">Enter one image URL per line</p>
      </div>
    </app-admin-form>
  `
})
export class ProductFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private supabaseService = inject(SupabaseService);

    productForm!: FormGroup;
    isEditMode = false;
    isSubmitting = false;
    productId: string | null = null;
    categories: any[] = [];

    ngOnInit(): void {
        this.initForm();
        this.loadCategories();
        this.checkEditMode();
    }

    private initForm(): void {
        this.productForm = this.fb.group({
            name: ['', [Validators.required]],
            slug: ['', [Validators.required]],
            description: [''],
            price: [0, [Validators.required, Validators.min(0.01)]],
            compare_at_price: [null],
            sku: ['', [Validators.required]],
            category_id: [''],
            images: [''],
            stock_quantity: [0, [Validators.required, Validators.min(0)]],
            weight: [null],
            is_active: [true],
            is_featured: [false],
            is_on_sale: [false]
        });
    }

    private async loadCategories(): Promise<void> {
        try {
            this.categories = await this.supabaseService.getCategories(false);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    private checkEditMode(): void {
        this.productId = this.route.snapshot.paramMap.get('id');
        if (this.productId) {
            this.isEditMode = true;
            this.loadProduct();
        }
    }

    private async loadProduct(): Promise<void> {
        if (!this.productId) return;

        try {
            const data = await this.supabaseService.getTableById('products', this.productId);
            if (data) {
                const formData = {
                    ...data,
                    images: Array.isArray(data.images) ? data.images.join('\n') : ''
                };
                this.productForm.patchValue(formData);
            }
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }

    onNameChange(event: any): void {
        const name = event.target.value;
        const slug = this.generateSlug(name);
        this.productForm.patchValue({ slug });
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    async onSubmit(formValue: any): Promise<void> {
        if (this.productForm.invalid) return;

        this.isSubmitting = true;

        try {
            const productData = {
                ...formValue,
                images: formValue.images ? formValue.images.split('\n').filter((url: string) => url.trim()) : [],
                updated_at: new Date().toISOString()
            };

            if (this.isEditMode && this.productId) {
                await this.supabaseService.updateRecord('products', this.productId, productData);
            } else {
                productData.created_at = new Date().toISOString();
                await this.supabaseService.createRecord('products', productData);
            }

            this.router.navigate(['/admin/products']);
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            this.isSubmitting = false;
        }
    }
} 