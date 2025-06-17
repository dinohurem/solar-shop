import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Users</h1>
          <p class="mt-2 text-gray-600">Manage user accounts and profiles</p>
        </div>
      </div>

      <!-- Data Table -->
      <app-data-table
        title="Users"
        [data]="(users$ | async) || []"
        [config]="tableConfig"
        [loading]="(loading$ | async) || false"
        (actionClicked)="onTableAction($event)"
        (addClicked)="onAddUser()"
        (rowClicked)="onRowClick($event)"
        (csvImported)="onCsvImported($event)">
      </app-data-table>
    </div>
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

    private usersSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    users$ = this.usersSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    tableConfig: TableConfig = {
        columns: [
            {
                key: 'avatar_url',
                label: 'Avatar',
                type: 'image',
                sortable: false,
                searchable: false
            },
            {
                key: 'first_name',
                label: 'First Name',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'last_name',
                label: 'Last Name',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'email',
                label: 'Email',
                type: 'text',
                sortable: true,
                searchable: true
            },
            {
                key: 'phone',
                label: 'Phone',
                type: 'text',
                sortable: false,
                searchable: true
            },
            {
                key: 'role',
                label: 'Role',
                type: 'status',
                sortable: true,
                searchable: true
            },
            {
                key: 'created_at',
                label: 'Created',
                type: 'date',
                sortable: true
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

    ngOnInit(): void {
        this.title.setTitle('Users - Solar Shop Admin');
        this.loadUsers();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;

        switch (action) {
            case 'edit':
                this.router.navigate(['/admin/users/edit', item.id]);
                break;
            case 'delete':
                this.deleteUser(item);
                break;
        }
    }

    onRowClick(item: any): void {
        // Navigate to edit form when row is clicked
        this.router.navigate(['/admin/users/edit', item.id]);
    }

    onAddUser(): void {
        this.router.navigate(['/admin/users/create']);
    }

    async onCsvImported(csvData: any[]): Promise<void> {
        // This should not be called since CSV import is disabled
        alert('CSV import is disabled for user management for security reasons');
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
        if (!confirm(`Are you sure you want to delete "${user.first_name} ${user.last_name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await this.supabaseService.deleteRecord('profiles', user.id);
            alert('User deleted successfully');
            this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    }
} 