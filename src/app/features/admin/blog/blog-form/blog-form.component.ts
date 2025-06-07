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
      <div [formGroup]="blogForm">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              (input)="onTitleChange($event)"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="Enter blog post title"
            >
            <div *ngIf="blogForm.get('title')?.invalid && blogForm.get('title')?.touched" class="mt-1 text-sm text-red-600">
              Title is required
            </div>
          </div>

          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700">URL Slug *</label>
            <input
              type="text"
              id="slug"
              formControlName="slug"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="blog-post-url-slug"
            >
            <div *ngIf="blogForm.get('slug')?.invalid && blogForm.get('slug')?.touched" class="mt-1 text-sm text-red-600">
              URL slug is required
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div>
          <label for="excerpt" class="block text-sm font-medium text-gray-700">Excerpt *</label>
          <textarea
            id="excerpt"
            formControlName="excerpt"
            rows="3"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="Enter a brief excerpt of the blog post"
          ></textarea>
          <div *ngIf="blogForm.get('excerpt')?.invalid && blogForm.get('excerpt')?.touched" class="mt-1 text-sm text-red-600">
            Excerpt is required
          </div>
        </div>

        <!-- Content -->
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700">Content *</label>
          <textarea
            id="content"
            formControlName="content"
            rows="12"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="Enter the full blog post content (supports Markdown)"
          ></textarea>
          <div *ngIf="blogForm.get('content')?.invalid && blogForm.get('content')?.touched" class="mt-1 text-sm text-red-600">
            Content is required
          </div>
          <p class="mt-2 text-sm text-gray-500">You can use Markdown formatting for rich text</p>
        </div>

        <!-- Images and Category -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="featured_image_url" class="block text-sm font-medium text-gray-700">Featured Image URL</label>
            <input
              type="url"
              id="featured_image_url"
              formControlName="featured_image_url"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="https://example.com/image.jpg"
            >
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

        <!-- Reading Time -->
        <div>
          <label for="reading_time" class="block text-sm font-medium text-gray-700">Reading Time (minutes)</label>
          <input
            type="number"
            id="reading_time"
            formControlName="reading_time"
            min="1"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="5"
          >
        </div>

        <!-- SEO Meta -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="seo_title" class="block text-sm font-medium text-gray-700">SEO Title</label>
            <input
              type="text"
              id="seo_title"
              formControlName="seo_title"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="SEO optimized title"
            >
          </div>

          <div>
            <label for="seo_description" class="block text-sm font-medium text-gray-700">SEO Description</label>
            <textarea
              id="seo_description"
              formControlName="seo_description"
              rows="2"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              placeholder="SEO description (160 characters max)"
            ></textarea>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700">Tags</label>
          <input
            type="text"
            id="tags"
            formControlName="tags"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
            placeholder="solar, energy, sustainability, environment"
          >
          <p class="mt-2 text-sm text-gray-500">Separate tags with commas</p>
        </div>

        <!-- Publishing -->
        <div class="space-y-4">
          <h4 class="text-lg font-medium text-gray-900">Publishing Settings</h4>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700">Status *</label>
              <select
                id="status"
                formControlName="status"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label for="published_at" class="block text-sm font-medium text-gray-700">Publish Date</label>
              <input
                type="datetime-local"
                id="published_at"
                formControlName="published_at"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-solar-500 focus:border-solar-500 sm:text-sm"
              >
            </div>

            <div class="flex items-center pt-6">
              <input
                id="is_featured"
                type="checkbox"
                formControlName="is_featured"
                class="focus:ring-solar-500 h-4 w-4 text-solar-600 border-gray-300 rounded"
              >
              <label for="is_featured" class="ml-2 text-sm font-medium text-gray-700">Featured Post</label>
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