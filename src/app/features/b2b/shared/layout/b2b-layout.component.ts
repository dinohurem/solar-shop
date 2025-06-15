import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { B2bNavbarComponent } from '../navbar/b2b-navbar.component';
import { FooterComponent } from '../../../b2c/footer/footer.component';

@Component({
    selector: 'app-b2b-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, B2bNavbarComponent, FooterComponent],
    template: `
    <div class="min-h-screen flex flex-col">
      <!-- B2B Navbar -->
      <app-b2b-navbar></app-b2b-navbar>
      
      <!-- Main Content -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `,
})
export class B2bLayoutComponent { } 