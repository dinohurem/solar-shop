import { Component, OnInit, OnDestroy, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SortOptionsService, SortOption, SortField } from '../../../shared/services/sort-options.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-sort-options-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ 'sortOptions.manageSortOptions' | translate }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ 'sortOptions.subtitle' | translate }}</p>
          </div>
          <button
            (click)="openAddModal()"
            class="inline-flex items-center px-4 py-2 bg-solar-600 text-white text-sm font-medium rounded-lg hover:bg-solar-700 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ 'sortOptions.addSortOption' | translate }}
          </button>
        </div>
      </div>

      <!-- Sort Options List -->
      <div class="p-6">
        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-solar-600"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && sortOptions.length === 0" class="text-center py-8">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
          </svg>
          <p class="text-gray-500 font-medium">{{ 'sortOptions.noSortOptions' | translate }}</p>
          <p class="text-gray-400 text-sm mt-1">{{ 'sortOptions.noSortOptionsDescription' | translate }}</p>
        </div>

        <!-- Sort Options Table -->
        <div *ngIf="!loading && sortOptions.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'sortOptions.displayOrder' | translate }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'sortOptions.code' | translate }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'sortOptions.labelHr' | translate }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'sortOptions.labelEn' | translate }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'sortOptions.sortFields' | translate }}</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'sortOptions.isDefault' | translate }}</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'sortOptions.isEnabled' | translate }}</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'common.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let option of sortOptions; let i = index" class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="moveSortOption(option, -1)"
                      [disabled]="i === 0"
                      class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                      </svg>
                    </button>
                    <span class="text-sm text-gray-900">{{ option.display_order }}</span>
                    <button
                      (click)="moveSortOption(option, 1)"
                      [disabled]="i === sortOptions.length - 1"
                      class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="text-sm font-mono text-gray-900">{{ option.code }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ option.label_hr }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ option.label_en }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let sf of getSortFields(option); let i = index"
                          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                          [class.bg-blue-100]="sf.direction === 'asc'"
                          [class.text-blue-800]="sf.direction === 'asc'"
                          [class.bg-purple-100]="sf.direction === 'desc'"
                          [class.text-purple-800]="sf.direction === 'desc'">
                      {{ getFieldLabel(sf.field) }}
                      <svg *ngIf="sf.direction === 'asc'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                      </svg>
                      <svg *ngIf="sf.direction === 'desc'" class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <button
                    (click)="setAsDefault(option)"
                    [disabled]="option.is_default"
                    class="p-1 rounded-full transition-colors"
                    [class.text-yellow-500]="option.is_default"
                    [class.text-gray-300]="!option.is_default"
                    [class.hover:text-yellow-400]="!option.is_default"
                    [title]="option.is_default ? ('sortOptions.isDefault' | translate) : ('sortOptions.setAsDefault' | translate)">
                    <svg class="w-5 h-5" [class.fill-current]="option.is_default" [class.stroke-current]="!option.is_default" viewBox="0 0 24 24">
                      <path *ngIf="option.is_default" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      <path *ngIf="!option.is_default" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-center">
                  <button
                    (click)="toggleEnabled(option)"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    [class.bg-green-600]="option.is_enabled"
                    [class.bg-gray-300]="!option.is_enabled">
                    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          [class.translate-x-6]="option.is_enabled"
                          [class.translate-x-1]="!option.is_enabled"></span>
                  </button>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      (click)="openEditModal(option)"
                      class="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      [title]="'common.edit' | translate">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      (click)="confirmDelete(option)"
                      class="p-1 text-red-600 hover:text-red-800 transition-colors"
                      [title]="'common.delete' | translate">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" (click)="closeModal()"></div>

        <!-- Modal Content -->
        <div class="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editingOption ? ('sortOptions.editSortOption' | translate) : ('sortOptions.addSortOption' | translate) }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="saveOption()" #sortOptionForm="ngForm">
            <div class="space-y-4">
              <!-- Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'sortOptions.code' | translate }} *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.code"
                  name="code"
                  required
                  [disabled]="!!editingOption"
                  [placeholder]="'sortOptions.codePlaceholder' | translate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-solar-500 focus:border-solar-500 disabled:bg-gray-100 disabled:text-gray-500">
                <p *ngIf="codeExists" class="mt-1 text-sm text-red-600">{{ 'sortOptions.codeExists' | translate }}</p>
              </div>

              <!-- Label HR -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'sortOptions.labelHr' | translate }} *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.label_hr"
                  name="label_hr"
                  required
                  [placeholder]="'sortOptions.labelHrPlaceholder' | translate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-solar-500 focus:border-solar-500">
              </div>

              <!-- Label EN -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'sortOptions.labelEn' | translate }} *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.label_en"
                  name="label_en"
                  required
                  [placeholder]="'sortOptions.labelEnPlaceholder' | translate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-solar-500 focus:border-solar-500">
              </div>

              <!-- Sort Fields (Multi-field) -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">{{ 'sortOptions.sortFields' | translate }} *</label>
                  <button
                    type="button"
                    (click)="addSortField()"
                    class="inline-flex items-center px-2 py-1 text-xs font-medium text-solar-600 bg-solar-50 rounded hover:bg-solar-100 transition-colors">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    {{ 'sortOptions.addField' | translate }}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mb-2">{{ 'sortOptions.sortFieldsHint' | translate }}</p>

                <div class="space-y-2">
                  <div *ngFor="let sf of formData.sort_fields; let i = index"
                       class="flex items-center space-x-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <span class="text-xs text-gray-500 font-medium w-6">{{ i + 1 }}.</span>
                    <select
                      [(ngModel)]="sf.field"
                      [name]="'sort_field_' + i"
                      required
                      class="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-solar-500 focus:border-solar-500">
                      <option *ngFor="let field of availableFields" [value]="field.value">
                        {{ currentLang === 'en' ? field.label_en : field.label_hr }}
                      </option>
                    </select>
                    <select
                      [(ngModel)]="sf.direction"
                      [name]="'sort_direction_' + i"
                      required
                      class="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-solar-500 focus:border-solar-500">
                      <option value="asc">{{ 'sortOptions.ascending' | translate }}</option>
                      <option value="desc">{{ 'sortOptions.descending' | translate }}</option>
                    </select>
                    <button
                      type="button"
                      (click)="moveSortField(i, -1)"
                      [disabled]="i === 0"
                      class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="moveSortField(i, 1)"
                      [disabled]="i === formData.sort_fields.length - 1"
                      class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="removeSortField(i)"
                      [disabled]="formData.sort_fields.length <= 1"
                      class="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Display Order -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'sortOptions.displayOrder' | translate }}</label>
                <input
                  type="number"
                  [(ngModel)]="formData.display_order"
                  name="display_order"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-solar-500 focus:border-solar-500">
              </div>

              <!-- Options -->
              <div class="flex items-center space-x-6">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="formData.is_enabled"
                    name="is_enabled"
                    class="rounded text-solar-600 focus:ring-solar-500">
                  <span class="ml-2 text-sm text-gray-700">{{ 'sortOptions.isEnabled' | translate }}</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="formData.is_default"
                    name="is_default"
                    class="rounded text-solar-600 focus:ring-solar-500">
                  <span class="ml-2 text-sm text-gray-700">{{ 'sortOptions.isDefault' | translate }}</span>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                {{ 'common.cancel' | translate }}
              </button>
              <button
                type="submit"
                [disabled]="!sortOptionForm.valid || saving"
                class="px-4 py-2 text-sm font-medium text-white bg-solar-600 rounded-md hover:bg-solar-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                <span *ngIf="!saving">{{ editingOption ? ('common.save' | translate) : ('common.create' | translate) }}</span>
                <span *ngIf="saving" class="flex items-center">
                  <svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ 'common.saving' | translate }}...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" (click)="closeDeleteModal()"></div>
        <div class="inline-block p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg max-w-md w-full">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 class="ml-3 text-lg font-semibold text-gray-900">{{ 'sortOptions.deleteSortOption' | translate }}</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">{{ 'sortOptions.confirmDelete' | translate }}</p>
          <p class="text-sm text-gray-500 mb-4" *ngIf="deletingOption">
            <span class="font-medium">{{ deletingOption.label_hr }}</span> ({{ deletingOption.code }})
          </p>
          <div class="flex justify-end space-x-3">
            <button
              (click)="closeDeleteModal()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              {{ 'common.cancel' | translate }}
            </button>
            <button
              (click)="deleteOption()"
              [disabled]="deleting"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors">
              <span *ngIf="!deleting">{{ 'common.delete' | translate }}</span>
              <span *ngIf="deleting">{{ 'common.deleting' | translate }}...</span>
            </button>
          </div>
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
export class SortOptionsManagementComponent implements OnInit, OnDestroy {
  private sortOptionsService = inject(SortOptionsService);
  private translationService = inject(TranslationService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  @Output() sortOptionsChanged = new EventEmitter<void>();

  sortOptions: SortOption[] = [];
  loading = true;
  saving = false;
  deleting = false;

  showModal = false;
  showDeleteModal = false;
  editingOption: SortOption | null = null;
  deletingOption: SortOption | null = null;
  codeExists = false;

  availableFields: { value: string; label_hr: string; label_en: string }[] = [];
  currentLang = 'hr';

  formData: Omit<SortOption, 'id' | 'created_at' | 'updated_at'> = {
    code: '',
    label_hr: '',
    label_en: '',
    field: 'name',
    direction: 'asc',
    sort_fields: [{ field: 'name', direction: 'asc' }],
    is_default: false,
    is_enabled: true,
    display_order: 0
  };

  ngOnInit(): void {
    this.availableFields = this.sortOptionsService.getAvailableFields();
    this.currentLang = this.translationService.getCurrentLanguage();

    this.translationService.currentLanguage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(lang => {
      this.currentLang = lang;
    });

    this.sortOptionsService.sortOptions$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(options => {
      this.sortOptions = options;
    });

    this.sortOptionsService.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.loading = loading;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFieldLabel(field: string): string {
    const found = this.availableFields.find(f => f.value === field);
    if (found) {
      return this.currentLang === 'en' ? found.label_en : found.label_hr;
    }
    return field;
  }

  openAddModal(): void {
    this.editingOption = null;
    this.formData = {
      code: '',
      label_hr: '',
      label_en: '',
      field: 'name',
      direction: 'asc',
      sort_fields: [{ field: 'name', direction: 'asc' }],
      is_default: false,
      is_enabled: true,
      display_order: this.sortOptions.length
    };
    this.codeExists = false;
    this.showModal = true;
  }

  openEditModal(option: SortOption): void {
    this.editingOption = option;
    // Get sort_fields from option, or create from legacy field/direction
    // Deep copy the sort_fields array to avoid reference issues
    const sortFields = option.sort_fields && option.sort_fields.length > 0
      ? option.sort_fields.map(sf => ({ field: sf.field, direction: sf.direction }))
      : [{ field: option.field, direction: option.direction }];

    this.formData = {
      code: option.code,
      label_hr: option.label_hr,
      label_en: option.label_en,
      field: option.field,
      direction: option.direction,
      sort_fields: sortFields,
      is_default: option.is_default,
      is_enabled: option.is_enabled,
      display_order: option.display_order
    };
    this.codeExists = false;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingOption = null;
  }

  async saveOption(): Promise<void> {
    if (this.saving) return;

    // Check for duplicate code when creating new
    if (!this.editingOption) {
      const existingCodes = this.sortOptions.map(o => o.code.toLowerCase());
      if (existingCodes.includes(this.formData.code.toLowerCase())) {
        this.codeExists = true;
        return;
      }
    }

    // Sync legacy field/direction with first sort_fields entry
    if (this.formData.sort_fields.length > 0) {
      this.formData.field = this.formData.sort_fields[0].field;
      this.formData.direction = this.formData.sort_fields[0].direction;
    }

    this.saving = true;

    try {
      if (this.editingOption) {
        const success = await this.sortOptionsService.updateSortOption(this.editingOption.id!, this.formData);
        if (success) {
          this.toastService.showSuccess(this.translationService.translate('sortOptions.sortOptionUpdated'));
          this.sortOptionsChanged.emit();
        } else {
          this.toastService.showError(this.translationService.translate('sortOptions.errorUpdating'));
        }
      } else {
        const result = await this.sortOptionsService.createSortOption(this.formData);
        if (result) {
          this.toastService.showSuccess(this.translationService.translate('sortOptions.sortOptionCreated'));
          this.sortOptionsChanged.emit();
        } else {
          this.toastService.showError(this.translationService.translate('sortOptions.errorCreating'));
        }
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving sort option:', error);
      this.toastService.showError(this.translationService.translate('sortOptions.errorCreating'));
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(option: SortOption): void {
    this.deletingOption = option;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingOption = null;
  }

  async deleteOption(): Promise<void> {
    if (!this.deletingOption || this.deleting) return;

    this.deleting = true;

    try {
      const success = await this.sortOptionsService.deleteSortOption(this.deletingOption.id!);
      if (success) {
        this.toastService.showSuccess(this.translationService.translate('sortOptions.sortOptionDeleted'));
        this.sortOptionsChanged.emit();
      } else {
        this.toastService.showError(this.translationService.translate('sortOptions.errorDeleting'));
      }
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error deleting sort option:', error);
      this.toastService.showError(this.translationService.translate('sortOptions.errorDeleting'));
    } finally {
      this.deleting = false;
    }
  }

  async setAsDefault(option: SortOption): Promise<void> {
    if (option.is_default) return;

    const success = await this.sortOptionsService.setDefaultSortOption(option.id!);
    if (success) {
      this.toastService.showSuccess(this.translationService.translate('sortOptions.sortOptionUpdated'));
      this.sortOptionsChanged.emit();
    } else {
      this.toastService.showError(this.translationService.translate('sortOptions.errorUpdating'));
    }
  }

  async toggleEnabled(option: SortOption): Promise<void> {
    const success = await this.sortOptionsService.toggleSortOptionEnabled(option.id!, !option.is_enabled);
    if (success) {
      this.sortOptionsChanged.emit();
    } else {
      this.toastService.showError(this.translationService.translate('sortOptions.errorUpdating'));
    }
  }

  async moveSortOption(option: SortOption, direction: -1 | 1): Promise<void> {
    const currentIndex = this.sortOptions.findIndex(o => o.id === option.id);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= this.sortOptions.length) return;

    const otherOption = this.sortOptions[newIndex];

    // Swap display orders using actual index positions to ensure unique values
    const updates = [
      { id: option.id!, display_order: newIndex },
      { id: otherOption.id!, display_order: currentIndex }
    ];

    const success = await this.sortOptionsService.updateDisplayOrder(updates);
    if (success) {
      this.sortOptionsChanged.emit();
    }
  }

  // Helper to get sort fields from an option (with legacy fallback)
  getSortFields(option: SortOption): SortField[] {
    if (option.sort_fields && option.sort_fields.length > 0) {
      return option.sort_fields;
    }
    // Fallback to legacy single field/direction
    return [{ field: option.field, direction: option.direction }];
  }

  // Add a new sort field to the form
  addSortField(): void {
    this.formData.sort_fields.push({ field: 'name', direction: 'asc' });
  }

  // Remove a sort field from the form
  removeSortField(index: number): void {
    if (this.formData.sort_fields.length > 1) {
      this.formData.sort_fields.splice(index, 1);
    }
  }

  // Move a sort field up or down in the list
  moveSortField(index: number, direction: -1 | 1): void {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.formData.sort_fields.length) return;

    // Create a new array with swapped positions to trigger Angular change detection
    const newArray = [...this.formData.sort_fields];
    const temp = { ...newArray[index] };
    newArray[index] = { ...newArray[newIndex] };
    newArray[newIndex] = temp;
    this.formData.sort_fields = newArray;
  }
}
