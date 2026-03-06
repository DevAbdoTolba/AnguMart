import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styles: [],
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  isLoading = true;
  errorMessage = '';

  addingToCart = false;
  cartMessage = '';
  cartMessageType: 'success' | 'error' = 'success';

  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.errorMessage = 'Product not found.';
      this.isLoading = false;
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (response) => {
        this.product = response.data.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load product:', err);
        this.errorMessage = 'Failed to load product details. Please try again.';
        this.isLoading = false;
      },
    });
  }

  addToCart(): void {
    if (!this.product || this.addingToCart) return;

    this.addingToCart = true;
    this.cartMessage = '';

    this.cartService.addItem(this.product._id, this.quantity).subscribe({
      next: () => {
        this.cartMessage = 'Added to cart!';
        this.cartMessageType = 'success';
        this.addingToCart = false;
        this.quantity = 1;
      },
      error: (err) => {
        console.error('Failed to add to cart:', err);
        this.cartMessage = err.error?.message || 'Could not add to cart. Please try again.';
        this.cartMessageType = 'error';
        this.addingToCart = false;
      },
    });
  }

  incrementQuantity(): void {
    const max = this.product?.stock ?? 99;
    if (this.quantity < max) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating ?? 0)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating ?? 0)).fill(0);
  }
}
