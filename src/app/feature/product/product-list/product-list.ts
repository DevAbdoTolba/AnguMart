import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product, ProductQueryParams } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products: Product[] = [];
  isLoading = true;
  errorMessage = '';

  // Pagination
  currentPage = 1;
  pageSize = 8;
  totalPages = 0;
  resultsCount = 0;

  // Sorting
  currentSort = '-createdAt';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const params: ProductQueryParams = {
      page: this.currentPage,
      limit: this.pageSize,
      sort: this.currentSort,
    };

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.data.data;
        this.totalPages = response.data.pages;
        this.resultsCount = response.results;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoading = false;
      },
    });
  }

  get totalProducts(): number {
    if (this.totalPages === 0) return 0;
    // On the last page we know exact remaining count
    if (this.currentPage === this.totalPages) {
      return (this.totalPages - 1) * this.pageSize + this.resultsCount;
    }
    return this.totalPages * this.pageSize;
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startingIndex(): number {
    if (this.totalProducts === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endingIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalProducts);
  }

  getStars(rating: number): string {
    const r = rating ?? 0;
    const fullStars = '★'.repeat(Math.floor(r));
    const emptyStars = '☆'.repeat(5 - Math.floor(r));
    return fullStars + emptyStars;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }
}
