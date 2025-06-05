import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../hero/hero.component';
import { ProductsComponent } from '../products/products.component';
import { SustainabilityComponent } from '../sustainability/sustainability.component';
import { BlogHomeComponent } from '../blog/blog-home.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, SustainabilityComponent, ProductsComponent, BlogHomeComponent],
  template: `
    <app-hero></app-hero>
    <app-products></app-products>
    <app-blog-home></app-blog-home>
    <app-sustainability></app-sustainability>
  `,
})
export class HomeComponent {
} 