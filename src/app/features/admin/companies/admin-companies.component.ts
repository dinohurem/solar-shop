import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Company } from '../../../shared/models/company.model';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-['Poppins']">
            Company Management
          </h1>
          <p class="text-gray-600 mt-1 font-['DM_Sans']">
            Manage partner company applications and approvals
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select [(ngModel)]="selectedStatus" (ngModelChange)="filterCompanies()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <!-- Business Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select [(ngModel)]="selectedBusinessType" (ngModelChange)="filterCompanies()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">All Types</option>
              <option value="retailer">Retailer</option>
              <option value="wholesaler">Wholesaler</option>
              <option value="installer">Installer</option>
              <option value="distributor">Distributor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input [(ngModel)]="searchTerm" (ngModelChange)="filterCompanies()" 
                   type="text" placeholder="Search companies..."
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
          </div>

          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select [(ngModel)]="selectedDateRange" (ngModelChange)="filterCompanies()" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-solar-500">
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Companies</p>
              <p class="text-2xl font-bold text-gray-900">{{ getTotalCompanies() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending Approval</p>
              <p class="text-2xl font-bold text-gray-900">{{ getPendingCount() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Approved Companies</p>
              <p class="text-2xl font-bold text-gray-900">{{ getApprovedCount() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rejected Companies</p>
              <p class="text-2xl font-bold text-gray-900">{{ getRejectedCount() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Companies Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 font-['Poppins']">
            Company Applications
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Person
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let company of filteredCompanies" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ company.companyName }}</div>
                    <div class="text-sm text-gray-500">{{ company.taxNumber }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ company.contactPersonName }}</div>
                    <div class="text-sm text-gray-500">{{ company.companyEmail }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getBusinessTypeClass(company.businessType)">
                    {{ getBusinessTypeLabel(company.businessType) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(company.status)">
                    {{ getStatusLabel(company.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(company.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button (click)="viewCompany(company)" 
                            class="text-solar-600 hover:text-solar-900">
                      View
                    </button>
                    <button *ngIf="company.status === 'pending'" 
                            (click)="approveCompany(company)" 
                            class="text-green-600 hover:text-green-900">
                      Approve
                    </button>
                    <button *ngIf="company.status === 'pending'" 
                            (click)="rejectCompany(company)" 
                            class="text-red-600 hover:text-red-900">
                      Reject
                    </button>
                    <button (click)="editCompany(company)" 
                            class="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    <button (click)="deleteCompany(company)" 
                            class="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div *ngIf="filteredCompanies.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p class="text-gray-600">No company applications match your current filters.</p>
        </div>
      </div>
    </div>

    <!-- Company Details Modal -->
    <div *ngIf="selectedCompany" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 font-['Poppins']">
              Company Details
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Company Information -->
          <div class="space-y-6">
            <!-- Basic Info -->
            <div>
              <h4 class="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Company Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Tax Number</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.taxNumber }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Business Type</label>
                  <p class="mt-1 text-sm text-gray-900">{{ getBusinessTypeLabel(selectedCompany.businessType) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Years in Business</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.yearsInBusiness }} years</p>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div>
              <h4 class="text-md font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.contactPersonName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyEmail }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.companyPhone }}</p>
                </div>
                <div *ngIf="selectedCompany.website">
                  <label class="block text-sm font-medium text-gray-700">Website</label>
                  <p class="mt-1 text-sm text-gray-900">
                    <a [href]="selectedCompany.website" target="_blank" class="text-solar-600 hover:text-solar-700">
                      {{ selectedCompany.website }}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <!-- Address -->
            <div>
              <h4 class="text-md font-semibold text-gray-900 mb-3">Address</h4>
              <p class="text-sm text-gray-900">{{ selectedCompany.companyAddress }}</p>
            </div>

            <!-- Business Details -->
            <div *ngIf="selectedCompany.annualRevenue || selectedCompany.numberOfEmployees || selectedCompany.description">
              <h4 class="text-md font-semibold text-gray-900 mb-3">Business Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngIf="selectedCompany.annualRevenue">
                  <label class="block text-sm font-medium text-gray-700">Annual Revenue</label>
                  <p class="mt-1 text-sm text-gray-900">€{{ selectedCompany.annualRevenue | number }}</p>
                </div>
                <div *ngIf="selectedCompany.numberOfEmployees">
                  <label class="block text-sm font-medium text-gray-700">Number of Employees</label>
                  <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.numberOfEmployees }}</p>
                </div>
              </div>
              <div *ngIf="selectedCompany.description" class="mt-4">
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <p class="mt-1 text-sm text-gray-900">{{ selectedCompany.description }}</p>
              </div>
            </div>

            <!-- Status and Actions -->
            <div class="border-t pt-4">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-sm font-medium text-gray-700">Current Status: </span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(selectedCompany.status)">
                    {{ getStatusLabel(selectedCompany.status) }}
                  </span>
                </div>
                <div class="flex space-x-2">
                  <button *ngIf="selectedCompany.status === 'pending'" 
                          (click)="approveCompany(selectedCompany)" 
                          class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                    Approve
                  </button>
                  <button *ngIf="selectedCompany.status === 'pending'" 
                          (click)="rejectCompany(selectedCompany)" 
                          class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminCompaniesComponent implements OnInit {
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  selectedCompany: Company | null = null;

  // Filters
  selectedStatus = '';
  selectedBusinessType = '';
  searchTerm = '';
  selectedDateRange = '';

  constructor() { }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    // Sample data - replace with actual API call
    this.companies = [
      {
        id: '1',
        contactPersonId: 'user1',
        contactPersonName: 'John Smith',
        companyName: 'Solar Solutions Ltd.',
        taxNumber: 'HR12345678901',
        companyAddress: 'Ilica 10, 10000 Zagreb, Croatia',
        companyPhone: '+385 1 234 5678',
        companyEmail: 'info@solarsolutions.hr',
        website: 'https://solarsolutions.hr',
        businessType: 'installer',
        yearsInBusiness: 5,
        annualRevenue: 500000,
        numberOfEmployees: 15,
        description: 'Professional solar panel installation company with 5 years of experience.',
        status: 'pending',
        approved: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        contactPersonId: 'user2',
        contactPersonName: 'Ana Marić',
        companyName: 'Green Energy d.o.o.',
        taxNumber: 'HR98765432109',
        companyAddress: 'Vukovarska 20, 21000 Split, Croatia',
        companyPhone: '+385 21 123 456',
        companyEmail: 'contact@greenenergy.hr',
        website: 'https://greenenergy.hr',
        businessType: 'retailer',
        yearsInBusiness: 8,
        annualRevenue: 1200000,
        numberOfEmployees: 25,
        description: 'Leading retailer of renewable energy solutions in Dalmatia region.',
        status: 'approved',
        approved: true,
        approvedAt: new Date('2024-01-10'),
        approvedBy: 'admin1',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        contactPersonId: 'user3',
        contactPersonName: 'Marko Novak',
        companyName: 'EcoTech Systems',
        taxNumber: 'HR11223344556',
        companyAddress: 'Savska 15, 10000 Zagreb, Croatia',
        companyPhone: '+385 1 987 654',
        companyEmail: 'info@ecotech.hr',
        businessType: 'distributor',
        yearsInBusiness: 3,
        annualRevenue: 800000,
        numberOfEmployees: 12,
        description: 'Distributor of high-quality solar equipment and components.',
        status: 'rejected',
        approved: false,
        rejectedAt: new Date('2024-01-12'),
        rejectedBy: 'admin1',
        rejectionReason: 'Insufficient business experience',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-12')
      }
    ];

    this.filteredCompanies = [...this.companies];
  }

  filterCompanies(): void {
    this.filteredCompanies = this.companies.filter(company => {
      const matchesStatus = !this.selectedStatus || company.status === this.selectedStatus;
      const matchesBusinessType = !this.selectedBusinessType || company.businessType === this.selectedBusinessType;
      const matchesSearch = !this.searchTerm ||
        company.companyName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (company.contactPersonName && company.contactPersonName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        company.companyEmail.toLowerCase().includes(this.searchTerm.toLowerCase());

      let matchesDate = true;
      if (this.selectedDateRange) {
        const now = new Date();
        const companyDate = new Date(company.createdAt);

        switch (this.selectedDateRange) {
          case 'today':
            matchesDate = companyDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = companyDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = companyDate >= monthAgo;
            break;
        }
      }

      return matchesStatus && matchesBusinessType && matchesSearch && matchesDate;
    });
  }

  getTotalCompanies(): number {
    return this.companies.length;
  }

  getPendingCount(): number {
    return this.companies.filter(c => c.status === 'pending').length;
  }

  getApprovedCount(): number {
    return this.companies.filter(c => c.status === 'approved').length;
  }

  getRejectedCount(): number {
    return this.companies.filter(c => c.status === 'rejected').length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  getBusinessTypeClass(type: string): string {
    switch (type) {
      case 'retailer':
        return 'bg-blue-100 text-blue-800';
      case 'wholesaler':
        return 'bg-purple-100 text-purple-800';
      case 'installer':
        return 'bg-green-100 text-green-800';
      case 'distributor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getBusinessTypeLabel(type: string): string {
    switch (type) {
      case 'retailer':
        return 'Retailer';
      case 'wholesaler':
        return 'Wholesaler';
      case 'installer':
        return 'Installer';
      case 'distributor':
        return 'Distributor';
      case 'other':
        return 'Other';
      default:
        return type;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewCompany(company: Company): void {
    this.selectedCompany = company;
  }

  closeModal(): void {
    this.selectedCompany = null;
  }

  approveCompany(company: Company): void {
    if (confirm(`Are you sure you want to approve ${company.companyName}?`)) {
      company.status = 'approved';
      company.approved = true;
      company.approvedAt = new Date();
      company.approvedBy = 'current-admin-id'; // Replace with actual admin ID
      company.updatedAt = new Date();

      // TODO: Implement API call to update company status
      console.log('Approved company:', company);

      // Close modal if it's open
      if (this.selectedCompany?.id === company.id) {
        this.closeModal();
      }

      // Refresh filtered list
      this.filterCompanies();
    }
  }

  rejectCompany(company: Company): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && confirm(`Are you sure you want to reject ${company.companyName}?`)) {
      company.status = 'rejected';
      company.approved = false;
      company.rejectedAt = new Date();
      company.rejectedBy = 'current-admin-id'; // Replace with actual admin ID
      company.rejectionReason = reason;
      company.updatedAt = new Date();

      // TODO: Implement API call to update company status
      console.log('Rejected company:', company);

      // Close modal if it's open
      if (this.selectedCompany?.id === company.id) {
        this.closeModal();
      }

      // Refresh filtered list
      this.filterCompanies();
    }
  }

  editCompany(company: Company): void {
    // TODO: Navigate to edit form or open edit modal
    console.log('Edit company:', company);
  }

  deleteCompany(company: Company): void {
    if (confirm(`Are you sure you want to delete ${company.companyName}? This action cannot be undone.`)) {
      const index = this.companies.findIndex(c => c.id === company.id);
      if (index > -1) {
        this.companies.splice(index, 1);
        this.filterCompanies();

        // Close modal if it's open
        if (this.selectedCompany?.id === company.id) {
          this.closeModal();
        }

        // TODO: Implement API call to delete company
        console.log('Deleted company:', company);
      }
    }
  }
} 