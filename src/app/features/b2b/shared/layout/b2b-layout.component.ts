import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { B2bNavbarComponent } from '../navbar/b2b-navbar.component';
import { PartnersFooterComponent } from '../footer/partners-footer.component';

@Component({
  selector: 'app-b2b-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, B2bNavbarComponent, PartnersFooterComponent],
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
    </div>
  `,
})
export class B2bLayoutComponent { } 