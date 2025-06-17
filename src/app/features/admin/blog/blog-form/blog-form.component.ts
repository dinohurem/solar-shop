import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AdminFormComponent } from '../../shared/admin-form/admin-form.component';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormComponent],
  template: `
    <app-admin-form
      [title]="isEditMode ? 'Edit Blog Post' : 'Create Blog Post'"
      [subtitle]="isEditMode ? 'Update blog post content' : 'Create a new blog post'"
      [form]="blogForm"
      [isEditMode]="isEditMode"
      [isSubmitting]="isSubmitting"
      [backRoute]="'/admin/blog'"
      (formSubmit)="onSubmit($event)"
    >
      <div [formGroup]="blogForm" class="space-y-8">
        <!-- Basic Info -->
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
              id="title"
              formControlName="title"
              (input)="onTitleChange($event)"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="Blog Post Title"
              >
              <label for="title" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Title *
              </label>
              <div *ngIf="blogForm.get('title')?.invalid && blogForm.get('title')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              Title is required
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
                URL Slug *
              </label>
              <div *ngIf="blogForm.get('slug')?.invalid && blogForm.get('slug')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              URL slug is required
            </div>
          </div>
        </div>

          <div class="mt-6">
            <div class="relative">
          <textarea
            id="excerpt"
            formControlName="excerpt"
            rows="3"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
                placeholder="Brief excerpt of the blog post"
          ></textarea>
              <label for="excerpt" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Excerpt *
              </label>
              <div *ngIf="blogForm.get('excerpt')?.invalid && blogForm.get('excerpt')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
            Excerpt is required
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Content
          </h3>
          
          <div class="relative">
          <textarea
            id="content"
            formControlName="content"
            rows="12"
              class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
              placeholder="Full blog post content (supports Markdown)"
          ></textarea>
            <label for="content" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
              Content *
            </label>
            <div *ngIf="blogForm.get('content')?.invalid && blogForm.get('content')?.touched" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            Content is required
            </div>
            <p class="mt-3 text-sm text-gray-500 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              You can use Markdown formatting for rich text
            </p>
          </div>
        </div>

        <!-- Media & Organization -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Media & Organization
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="url"
              id="featured_image_url"
              formControlName="featured_image_url"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="https://example.com/image.jpg"
            >
              <label for="featured_image_url" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Featured Image URL
              </label>
          </div>

            <div class="relative">
            <select
              id="category_id"
              formControlName="category_id"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
            >
              <option value="">Select a category</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Category
              </label>
          </div>
        </div>

          <div class="mt-6">
            <div class="relative">
          <input
            type="number"
            id="reading_time"
            formControlName="reading_time"
            min="1"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
            placeholder="5"
          >
              <label for="reading_time" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Reading Time (minutes)
              </label>
            </div>
          </div>

          <div class="mt-6">
            <div class="relative">
              <input
                type="text"
                id="tags"
                formControlName="tags"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
                placeholder="solar, energy, sustainability, environment"
              >
              <label for="tags" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                Tags
              </label>
              <p class="mt-3 text-sm text-gray-500 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Separate tags with commas
              </p>
            </div>
          </div>
        </div>

        <!-- SEO Meta -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            SEO Optimization
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="relative">
            <input
              type="text"
              id="seo_title"
              formControlName="seo_title"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent"
              placeholder="SEO optimized title"
            >
              <label for="seo_title" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                SEO Title
              </label>
          </div>

            <div class="relative">
            <textarea
              id="seo_description"
              formControlName="seo_description"
              rows="2"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 placeholder-transparent resize-none"
              placeholder="SEO description (160 characters max)"
            ></textarea>
              <label for="seo_description" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600">
                SEO Description
              </label>
            </div>
          </div>
        </div>

        <!-- Publishing -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Publishing Settings
          </h3>
          
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="relative">
              <select
                id="status"
                formControlName="status"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <label class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Status *
              </label>
            </div>

            <div class="relative">
              <input
                type="datetime-local"
                id="published_at"
                formControlName="published_at"
                class="peer w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors duration-200"
              >
              <label for="published_at" class="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-700">
                Publish Date
              </label>
            </div>

            <div class="flex items-center">
              <label class="relative flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-colors duration-200 w-full">
              <input
                id="is_featured"
                type="checkbox"
                formControlName="is_featured"
                  class="sr-only"
                >
                <span class="flex items-center">
                  <span class="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded mr-3 transition-colors duration-200" 
                        [class.bg-blue-600]="blogForm.get('is_featured')?.value"
                        [class.border-blue-600]="blogForm.get('is_featured')?.value">
                    <svg *ngIf="blogForm.get('is_featured')?.value" class="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </span>
                  <span class="text-sm font-medium text-gray-700">Featured Post</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </app-admin-form>
  `
})
export class BlogFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private title = inject(Title);

  blogForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  blogId: string | null = null;
  categories: any[] = [];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.checkEditMode();
  }

  private initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required]],
      slug: ['', [Validators.required]],
      excerpt: ['', [Validators.required]],
      content: ['', [Validators.required]],
      featured_image_url: [''],
      category_id: [''],
      reading_time: [5],
      seo_title: [''],
      seo_description: [''],
      tags: [''],
      status: ['draft', [Validators.required]],
      published_at: [''],
      is_featured: [false]
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
    this.blogId = this.route.snapshot.paramMap.get('id');
    if (this.blogId) {
      this.isEditMode = true;
      this.loadBlogPost();
    }
    // Set title after determining edit mode
    this.title.setTitle(this.isEditMode ? 'Edit Blog Post - Solar Shop Admin' : 'Create Blog Post - Solar Shop Admin');
  }

  private async loadBlogPost(): Promise<void> {
    if (!this.blogId) return;

    try {
      const data = await this.supabaseService.getTableById('blog_posts', this.blogId);
      if (data) {
        const formData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          published_at: data.published_at ? this.formatDateTimeLocal(new Date(data.published_at)) : ''
        };
        this.blogForm.patchValue(formData);
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
    }
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onTitleChange(event: any): void {
    const title = event.target.value;
    const slug = this.generateSlug(title);
    this.blogForm.patchValue({ slug });

    // Auto-fill meta title if empty
    if (!this.blogForm.get('seo_title')?.value) {
      this.blogForm.patchValue({ seo_title: title });
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async onSubmit(formValue: any): Promise<void> {
    if (this.blogForm.invalid) return;

    this.isSubmitting = true;

    try {
      const blogData = {
        ...formValue,
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
        published_at: formValue.published_at ? new Date(formValue.published_at).toISOString() : null,
        updated_at: new Date().toISOString()
      };

      if (this.isEditMode && this.blogId) {
        await this.supabaseService.updateRecord('blog_posts', this.blogId, blogData);
      } else {
        blogData.created_at = new Date().toISOString();
        await this.supabaseService.createRecord('blog_posts', blogData);
      }

      this.router.navigate(['/admin/blog']);
    } catch (error) {
      console.error('Error saving blog post:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
} 