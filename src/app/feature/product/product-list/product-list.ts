import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { Product, ProductQueryParams } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { Navbar } from '../../../layout/navbar/navbar';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, Navbar],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = true;
  errorMessage = '';

  // Search
  searchTerm = '';
  isSearchFetching = false; // True while debounced API call is pending
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  // Pagination
  currentPage = 1;
  pageSize = 8;
  totalPages = 0;
  resultsCount = 0;

  // Sorting
  currentSort = '-createdAt';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        // Debounce completed → now fetch from API
        this.currentPage = 1;
        this.loadProducts();
      });

    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onSearchChanged(term: string): void {
    // 1. Instant UI update — filteredProducts getter reacts immediately
    this.searchTerm = term;

    // 2. Mark that an API fetch is pending (debounced)
    this.isSearchFetching = true;

    // 3. Feed debounce pipeline for the API call
    this.searchSubject.next(term);
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const params: ProductQueryParams = {
      page: this.currentPage,
      limit: this.pageSize,
      sort: this.currentSort,
    };

    // Send search term to API for server-side filtering
    if (this.searchTerm.trim()) {
      params['name'] = this.searchTerm.trim();
    }

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.data.data;
        this.totalPages = response.data.pages;
        this.resultsCount = response.results;
        this.isLoading = false;
        this.isSearchFetching = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoading = false;
        this.isSearchFetching = false;
      },
    });
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.products;
    return this.products.filter(p => p.name.toLowerCase().includes(term));
  }

  /** True when local filter shows empty but we're still waiting for the API */
  get showSearchLoading(): boolean {
    return this.filteredProducts.length === 0 && this.isSearchFetching;
  }

  get totalProducts(): number {
    if (this.totalPages === 0) return 0;
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
