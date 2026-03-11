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
  totalResults = 0;
  totalResultsKnown = false;
  private pageCache = new Map<number, Product[]>();
  private pageCounts = new Map<number, number>();
  private maxKnownPage = 0;
  private firstEmptyPage: number | null = null;
  private highestNonEmptyPage = 0;

  // Sorting
  currentSort = '-createdAt';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => {
        // Debounce completed → now fetch from API
        this.currentPage = 1;
        this.prefetchInitialPages();
      });

    this.prefetchInitialPages();
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

    const cached = this.pageCache.get(this.currentPage);
    if (cached) {
      this.products = cached;
      this.resultsCount = cached.length;
      this.updatePaginationForPage(this.currentPage, cached.length);
      this.isLoading = false;
      this.isSearchFetching = false;
      this.prefetchAdjacentPages();
      return;
    }

    this.fetchPage(this.currentPage);
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
    return this.totalResults;
  }

  get showTotalCount(): boolean {
    return this.totalResultsKnown;
  }

  get totalPagesArray(): number[] {
    const array: number[] = [];
    const window = 2; // 2 left + current + 2 right = 5 visible
    const start = Math.max(1, this.currentPage - window);
    const end = Math.min(this.totalPages, this.currentPage + window);
    for (let i = start; i <= end; i++) {
        array.push(i);
    }
    return array;
  }

  get startingIndex(): number {
    if (this.totalProducts === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endingIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalResults);
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

  private prefetchInitialPages(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.pageCache.clear();
    this.pageCounts.clear();
    this.maxKnownPage = 0;
    this.firstEmptyPage = null;
    this.highestNonEmptyPage = 0;
    this.totalPages = 1;
    this.totalResultsKnown = false;
    this.totalResults = 0;

    this.fetchPage(1, true);
    this.prefetchAdjacentPages();
  }

  private fetchPage(page: number, setCurrent: boolean = true): void {
    const params: ProductQueryParams = {
      page,
      limit: this.pageSize,
      sort: this.currentSort,
    };

    if (this.searchTerm.trim()) {
      params['name'] = this.searchTerm.trim();
    }

    this.productService.getProducts(params).subscribe({
      next: (response: any) => {
        const items = response.data?.data ?? [];
        const pageResults = items.length;
        const reportedResults = response.results ?? pageResults;
        const pagesFromApi = response.data?.pages;

        this.pageCache.set(page, items);
        this.pageCounts.set(page, pageResults);
        this.maxKnownPage = Math.max(this.maxKnownPage, page);

        // If the backend returns an empty page, clamp pagination to the last real page.
        if (pageResults === 0) {
          this.firstEmptyPage = this.firstEmptyPage ? Math.min(this.firstEmptyPage, page) : page;
          this.updateEffectiveTotalPages();
          this.totalResultsKnown = false;
          if (setCurrent) {
            this.currentPage = Math.max(1, this.totalPages);
            if (this.currentPage !== page) {
              this.loadProducts();
              return;
            }
          } else if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
          }
        } else if (typeof pagesFromApi === 'number' && pagesFromApi > 1) {
          this.totalPages = pagesFromApi;
          this.totalResults = (pagesFromApi - 1) * this.pageSize + pageResults;
          this.totalResultsKnown = true;
        } else if (reportedResults > pageResults) {
          this.totalResults = reportedResults;
          this.totalPages = Math.ceil(this.totalResults / this.pageSize) || 1;
          this.totalResultsKnown = true;
        } else {
          this.totalResultsKnown = false;
          this.totalResults = (this.currentPage - 1) * this.pageSize + this.resultsCount;
          this.highestNonEmptyPage = Math.max(this.highestNonEmptyPage, page);
          this.updateEffectiveTotalPages();
        }

        if (setCurrent) {
          this.products = items;
          this.resultsCount = items.length;
          this.updatePaginationForPage(page, pageResults);
          this.isLoading = false;
          this.isSearchFetching = false;
          this.prefetchAdjacentPages();
        }
      },
      error: (err: any) => {
        console.error('Failed to load products:', err);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoading = false;
        this.isSearchFetching = false;
      },
    });
  }

  private updatePaginationForPage(page: number, pageResults: number): void {
    if (pageResults === 0) {
      this.firstEmptyPage = this.firstEmptyPage ? Math.min(this.firstEmptyPage, page) : page;
      this.updateEffectiveTotalPages();
      return;
    }
    if (!this.totalResultsKnown) {
      this.totalResults = (page - 1) * this.pageSize + pageResults;
      this.highestNonEmptyPage = Math.max(this.highestNonEmptyPage, page);
      this.updateEffectiveTotalPages();
    }
  }

  private updateEffectiveTotalPages(): void {
    if (this.totalResultsKnown) return;
    let inferred = Math.max(this.highestNonEmptyPage, this.currentPage);
    if (this.firstEmptyPage !== null) {
      inferred = Math.min(inferred, Math.max(1, this.firstEmptyPage - 1));
    }
    this.totalPages = Math.max(1, inferred);
  }

  private prefetchAdjacentPages(): void {
    const next1 = this.currentPage + 1;
    const next2 = this.currentPage + 2;
    if (!this.pageCache.has(next1)) {
      this.fetchPage(next1, false);
    }
    if (!this.pageCache.has(next2)) {
      this.fetchPage(next2, false);
    }
  }
}
