import { Component } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  price: number;
  imageId: number;
}

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  products: Product[] = new Array(32).fill(0).map((_, i) => ({
    id: i + 1,
    name: 'Product ' + (i + 1),
    rating: i % 5 + 1,
    reviewCount: i * 10 + 10,
    price: (i * 10 + 10),
    imageId: i,
  }));

  currentPage = 1;
  pageSize = 8;

  get totalProducts(): number {
    return this.products.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.pageSize);
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

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.products.slice(start, end);
  }

  getStars(rating: number): string {
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return fullStars + emptyStars;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
