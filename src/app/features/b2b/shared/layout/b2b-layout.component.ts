import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { B2bNavbarComponent } from '../navbar/b2b-navbar.component';
import { PartnersFooterComponent } from '../footer/partners-footer.component';
import { B2BCartSidebarComponent } from '../../cart/components/b2b-cart-sidebar/b2b-cart-sidebar.component';

@Component({
  selector: 'app-b2b-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, B2bNavbarComponent, PartnersFooterComponent, B2BCartSidebarComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- B2B Navbar -->
      <app-b2b-navbar></app-b2b-navbar>
      
      <!-- Main Content -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Partners Footer -->
      <app-partners-footer></app-partners-footer>
      
      <!-- B2B Cart Sidebar -->
      <app-b2b-cart-sidebar></app-b2b-cart-sidebar>
    </div>
  `,
})
export class B2bLayoutComponent { } 