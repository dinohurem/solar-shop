import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
      <!-- Category Basic Info -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            id="name"
            formControlName="name"
            (input)="onNameChange($event)"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="Enter category name"
          >
          <div *ngIf="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched" class="mt-1 text-sm text-red-600">
            Name is required
          </div>
        </div>

        <div>
          <label for="slug" class="block text-sm font-medium text-gray-700">Slug *</label>
          <input
            type="text"
            id="slug"
            formControlName="slug"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="category-url-slug"
          >
          <div *ngIf="categoryForm.get('slug')?.invalid && categoryForm.get('slug')?.touched" class="mt-1 text-sm text-red-600">
            Slug is required
          </div>
        </div>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          formControlName="description"
          rows="3"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
          placeholder="Enter category description"
        ></textarea>
      </div>

      <!-- Image URL -->
      <div>
        <label for="image_url" class="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="url"
          id="image_url"
          formControlName="image_url"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
          placeholder="https://example.com/image.jpg"
        >
      </div>

      <!-- Sort Order and Status -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label for="sort_order" class="block text-sm font-medium text-gray-700">Sort Order</label>
          <input
            type="number"
            id="sort_order"
            formControlName="sort_order"
            min="0"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="0"
          >
        </div>

        <div class="flex items-center">
          <div class="flex items-center h-5">
            <input
              id="is_active"
              type="checkbox"
              formControlName="is_active"
              class="focus:ring-solar-500 h-4 w-4 text-solar-600 border-gray-300 rounded"
            >
          </div>
          <div class="ml-3 text-sm">
            <label for="is_active" class="font-medium text-gray-700">Active</label>
            <p class="text-gray-500">Enable this category in the store</p>
          </div>
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

    categoryForm!: FormGroup;
    isEditMode = false;
    isSubmitting = false;
    categoryId: string | null = null;

    ngOnInit(): void {
        this.initForm();
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