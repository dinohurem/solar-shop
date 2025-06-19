import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';

@Component({
    selector: 'app-admin-contacts',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="w-full max-w-full overflow-hidden">
      <div class="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div class="min-w-0 flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Contacts</h1>
            <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">View contact messages and newsletter subscriptions</p>
          </div>
        </div>

        <div class="w-full overflow-hidden">
          <app-data-table
            title="Contacts"
            [data]="(contacts$ | async) || []"
            [config]="tableConfig"
            [loading]="(loading$ | async) || false"
            (actionClicked)="onTableAction($event)"
            (rowClicked)="onRowClick($event)">
          </app-data-table>
        </div>
      </div>
    </div>

    <div *ngIf="selectedContact" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3 space-y-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Contact Details</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="space-y-2 text-sm">
            <p><strong>Name:</strong> {{ selectedContact.first_name }} {{ selectedContact.last_name }}</p>
            <p><strong>Email:</strong> {{ selectedContact.email }}</p>
            <p *ngIf="selectedContact.phone"><strong>Phone:</strong> {{ selectedContact.phone }}</p>
            <p *ngIf="selectedContact.company"><strong>Company:</strong> {{ selectedContact.company }}</p>
            <p *ngIf="selectedContact.subject"><strong>Subject:</strong> {{ selectedContact.subject }}</p>
            <p><strong>Newsletter:</strong> {{ selectedContact.is_newsletter ? 'Yes' : 'No' }}</p>
            <p><strong>Message:</strong></p>
            <p class="whitespace-pre-line">{{ selectedContact.message }}</p>
          </div>
          <div class="pt-4 text-right">
            <button (click)="closeModal()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class AdminContactsComponent implements OnInit {
    private supabaseService = inject(SupabaseService);

    private contactsSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);
    contacts$ = this.contactsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    selectedContact: any | null = null;

    tableConfig: TableConfig = {
        columns: [
            { key: 'first_name', label: 'First Name', type: 'text', sortable: true, searchable: true },
            { key: 'last_name', label: 'Last Name', type: 'text', sortable: true, searchable: true },
            { key: 'email', label: 'Email', type: 'text', sortable: true, searchable: true },
            { key: 'subject', label: 'Subject', type: 'text', sortable: true, searchable: true },
            { key: 'is_newsletter', label: 'Newsletter', type: 'boolean', sortable: true },
            { key: 'created_at', label: 'Created', type: 'date', sortable: true }
        ],
        actions: [
            { label: 'View', icon: 'eye', action: 'view', class: 'text-blue-600 hover:text-blue-900' },
            { label: 'Delete', icon: 'trash2', action: 'delete', class: 'text-red-600 hover:text-red-900' }
        ],
        searchable: true,
        sortable: true,
        paginated: true,
        pageSize: 20,
        allowCsvImport: false,
        allowExport: true,
        rowClickable: true
    };

    ngOnInit(): void {
        this.loadContacts();
    }

    onTableAction(event: { action: string, item: any }): void {
        const { action, item } = event;
        if (action === 'view') {
            this.selectedContact = item;
        } else if (action === 'delete') {
            this.deleteContact(item);
        }
    }

    onRowClick(item: any): void {
        this.selectedContact = item;
    }

    closeModal(): void {
        this.selectedContact = null;
    }

    private async loadContacts(): Promise<void> {
        this.loadingSubject.next(true);
        try {
            const contacts = await this.supabaseService.getTable('contacts');
            this.contactsSubject.next(contacts || []);
        } catch (error) {
            console.error('Error loading contacts:', error);
            this.contactsSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async deleteContact(contact: any): Promise<void> {
        if (!confirm('Delete this contact?')) return;
        try {
            await this.supabaseService.deleteRecord('contacts', contact.id);
            this.loadContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Error deleting contact');
        }
    }
}
