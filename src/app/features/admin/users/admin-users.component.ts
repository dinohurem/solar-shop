import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { SuccessModalComponent } from '../../../shared/components/modals/success-modal/success-modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, DataTableComponent, SuccessModalComponent, TranslatePipe],
    template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ 'adminUsers.title' | translate }}</h1>
          <p class="mt-2 text-gray-600">{{ 'adminUsers.subtitle' | translate }}</p>
        </div>
      </div>

      <!-- Data Table -->
      <app-data-table
        [title]="'adminUsers.title' | translate"
        [data]="(users$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddUser()"
        (rowClicked)="onRowClick($event)"
        (csvImported)="onCsvImported($event)">
      </app-data-table>
    </div>

    <!-- Success Modal -->
    <app-success-modal
      [isOpen]="showSuccessModal"
      [title]="successModalTitle"
      [message]="successModalMessage"
      (closed)="onSuccessModalClosed()"
    ></app-success-modal>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);
    private title = inject(Title);
    private translationService = inject(TranslationService);

    private usersSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    users$ = this.usersSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    // Modal properties
    showSuccessModal = false;
    successModalTitle = '';
    successModalMessage = '';

    tableConfig!: TableConfig;

    ngOnInit(): void {
        this.initializeTableConfig();
        this.title.setTitle(this.translationService.translate('adminUsers.title') + ' - Solar Shop Admin');
        this.loadUsers();
    }

    private initializeTableConfig(): void {
        this.tableConfig = {
            columns: [
                {
                    key: 'avatar_url',
                    label: 'Avatar',
                    type: 'image',
                    sortable: false,
                    searchable: false,
                    width: '8%',
                    minWidth: '60px'
                },
                {
                    key: 'first_name',
                    label: this.translationService.translate('adminUsers.firstName'),
                    type: 'text',
                    sortable: true,
                    searchable: true,
                    width: '15%',
                    minWidth: '120px',
                    maxWidth: '180px'
                },
                {
                    key: 'last_name',
                    label: this.translationService.translate('adminUsers.lastName'),
                    type: 'text',
                    sortable: true,
                    searchable: true,
                    width: '15%',
                    minWidth: '120px',
                    maxWidth: '180px'
                },
                {
                    key: 'email',
                    label: this.translationService.translate('adminUsers.email'),
                    type: 'text',
                    sortable: true,
                    searchable: true,
                    width: '25%',
                    minWidth: '200px',
                    maxWidth: '300px'
                },
                {
                    key: 'phone',
                    label: this.translationService.translate('adminUsers.phone'),
                    type: 'text',
                    sortable: false,
                    searchable: true,
                    width: '15%',
                    minWidth: '120px'
                },
                {
                    key: 'role',
                    label: this.translationService.translate('adminUsers.role'),
                    type: 'status',
                    sortable: true,
                    searchable: true,
                    width: '10%',
                    minWidth: '100px'
                },
                {
                    key: 'created_at',
                    label: 'Created',
                    type: 'date',
                    sortable: true,
                    width: '12%',
                    minWidth: '120px'
                }
            ],
            actions: [
                {
                    label: 'Edit',
                    icon: 'edit',
                    action: 'edit',
                    class: 'text-blue-600 hover:text-blue-900'
                },
                {
                    label: 'Delete',
                    icon: 'trash2',
                    action: 'delete',
                    class: 'text-red-600 hover:text-red-900'
                }
            ],
            searchable: true,
            sortable: true,
            paginated: true,
            pageSize: 20,
            allowCsvImport: false, // Disable CSV import for users for security
            allowExport: true,
            rowClickable: true
        };
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/korisnici/uredi', item.id]);
                break;
            case 'delete':
                this.deleteUser(item);
                break;
        }
    }

    onRowClick(item: any): void {
        // Navigate to edit form when row is clicked
        this.router.navigate(['/admin/korisnici/uredi', item.id]);
    }

    onAddUser(): void {
        this.router.navigate(['/admin/korisnici/novi']);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        // This should not be called since CSV import is disabled
        this.showSuccess('Error', 'CSV import is disabled for user management for security reasons');
    }

    private async loadUsers(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            const users = await this.supabaseService.getTable('profiles');
            this.usersSubject.next(users || []);
        } catch (error) {
            console.error('Error loading users:', error);
            this.usersSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async deleteUser(user: any): Promise<void> {
        try {
            await this.supabaseService.deleteRecord('profiles', user.id);
            this.showSuccess('Success', 'User deleted successfully');
            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showSuccess('Error', 'Error deleting user');
        }
    }

    private showSuccess(title: string, message: string): void {
        this.successModalTitle = title;
        this.successModalMessage = message;
        this.showSuccessModal = true;
    }

    onSuccessModalClosed(): void {
        this.showSuccessModal = false;
        this.successModalTitle = '';
        this.successModalMessage = '';
    }
} 