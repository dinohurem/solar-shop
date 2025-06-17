import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';

interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent],
  template: `
    <app-admin-form
      [title]="isEditMode ? 'Edit Category' : 'Create Category'"
      [subtitle]="isEditMode ? 'Update category information' : 'Add a new category to your store'"
      [form]="categoryForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/categories'"
      (formSubmit)="onSubmit($event)"
    >
      <div [formGroup]="categoryForm" class="space-y-8">
        <!-- Category Basic Info -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Basic Information
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <input
                type="text"
                id="name"
                formControlName="name"
                (input)="onNameChange($event)"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Category Name"
              >
              <label for="name" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Name *
              </label>
              <div *ngIf="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Name is required
              </div>
            </div>

            <div class="relative">
              <input
                type="text"
                id="slug"
                formControlName="slug"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="URL Slug"
              >
              <label for="slug" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Slug *
              </label>
              <div *ngIf="categoryForm.get('slug')?.invalid && categoryForm.get('slug')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                Slug is required
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="relative">
              <textarea
                id="description"
                formControlName="description"
                rows="3"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Category Description"
              ></textarea>
              <label for="description" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Description
              </label>
            </div>
          </div>
        </div>

        <!-- Media & Settings -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Media & Configuration
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
              <input
                type="url"
                id="image_url"
                formControlName="image_url"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="https://example.com/image.jpg"
              >
              <label for="image_url" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Image URL
              </label>
            </div>

            <div class="relative">
              <input
                type="number"
                id="sort_order"
                formControlName="sort_order"
                min="0"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="0"
              >
              <label for="sort_order" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Sort Order
              </label>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Category Status
          </h3>
          
          <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200">
            <input
              id="is_active"
              type="checkbox"
              formControlName="is_active"
              class="sr-only"
            >
            <span class="flex items-center">
              <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200" 
                    [class.bg-blue-600]="categoryForm.get('is_active')?.value"
                    [class.border-blue-600]="categoryForm.get('is_active')?.value">
                <svg *ngIf="categoryForm.get('is_active')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </span>
              <div>
                <span class="text-sm font-medium text-gray-700">Active</span>
                <p class="text-sm text-gray-500">Enable this category in the store</p>
              </div>
            </span>
          </label>
        </div>
      </div>
    </app-admin-form>
  `
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);

  categoryForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  categoryId: string | null = null;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      description: [''],
      image_url: [''],
      sort_order: [0, [Validators.min(0)]],
      is_active: [true]
    });
  }

  private checkEditMode(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategory();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Category - Solar Shop Admin' : 'Create Category - Solar Shop Admin');
  }

  private async loadCategory(): Promise<void> {
    if (!this.categoryId) return;

    try {
      const data = await this.supabaseService.getTableById('categories', this.categoryId);
      if (data) {
        this.categoryForm.patchValue(data);
      }
    } catch (error) {
      console.error('Error loading category:', error);
      // TODO: Show error notification
    }
  }

  onNameChange(event: any): void {
    const name = event.target.value;
    const slug = this.generateSlug(name);
    this.categoryForm.patchValue({ slug });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.categoryForm.invalid) return;

    this.isSubmitting = true;

    try {
      const categoryData = {
        ...formValue,
        updated_at: new Date().toISOString()
      };

      if (this.isEditMode && this.categoryId) {
        await this.supabaseService.updateRecord('categories', this.categoryId, categoryData);
      } else {
        categoryData.created_at = new Date().toISOString();
        await this.supabaseService.createRecord('categories', categoryData);
      }

      // Navigate back to categories list
      this.router.navigate(['/admin/categories']);
    } catch (error) {
      console.error('Error saving category:', error);
      // TODO: Show error notification
    } finally {
      this.isSubmitting = false;
    }
  }
} 