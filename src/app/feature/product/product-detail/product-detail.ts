import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Navbar } from '../../../layout/navbar/navbar';
import { ProductReview } from '../product-review/product-review';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, Navbar, ProductReview],
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

  // Wishlist Optimistic State
  isInWishlist = false;
  isWishlistLoading = false;
  wishlistMessage = '';
  wishlistMessageType: 'success' | 'error' = 'success';
  private wishlistSub!: import('rxjs').Subscription;

  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.errorMessage = 'Product not found.';
      this.isLoading = false;
    }

    // Subscribe to the global wishlist state so it updates instantly
    this.wishlistSub = this.wishlistService.wishlistIds$.subscribe(ids => {
      this.isInWishlist = this.product ? ids.has(this.product._id) : false;
    });

    // Fetch fresh wishlist data from the server
    if (localStorage.getItem('angumart_token')) {
      this.wishlistService.getWishlist().subscribe({
        error: (err) => console.log('Wishlist fetch error:', err)
      });
    }
  }

  ngOnDestroy(): void {
    if (this.wishlistSub) {
      this.wishlistSub.unsubscribe();
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (response: any) => {
        this.product = response.data.data;
        // Check initial wishlist presence upon load
        this.wishlistService.wishlistIds$.subscribe(ids => {
           if(this.product) this.isInWishlist = ids.has(this.product._id);
        }).unsubscribe(); // Check once immediately
        this.isLoading = false;
      },
      error: (err: any) => {
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
      error: (err: any) => {
        console.error('Failed to add to cart:', err);
        this.cartMessage = err.error?.message || 'Could not add to cart. Please try again.';
        this.cartMessageType = 'error';
        this.addingToCart = false;
      },
    });
  }

  toggleWishlist(): void {
    if (!this.product || this.isWishlistLoading) return;

    this.isWishlistLoading = true;
    this.wishlistMessage = '';

    const willBeAdded = !this.isInWishlist;
    
    // 1. Optimistically switch the UI INSTANTLY
    this.wishlistService.setOptimisticState(this.product._id, willBeAdded);

    // 2. Perform the matching backend operation
    const request = willBeAdded 
      ? this.wishlistService.addToWishlist(this.product._id)
      : this.wishlistService.removeFromWishlist(this.product._id);

    // 3. Confirm or Revert the change
    request.subscribe({
      next: () => {
        this.wishlistMessage = willBeAdded ? 'Added to wishlist!' : 'Removed from wishlist.';
        this.wishlistMessageType = 'success';
        this.isWishlistLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to update wishlist:', err);
        this.wishlistMessage = err.error?.message || 'Could not update wishlist. Reverting change...';
        this.wishlistMessageType = 'error';
        
        // Revert optimistically back to the original state
        this.wishlistService.setOptimisticState(this.product!._id, !willBeAdded);
        this.isWishlistLoading = false;
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
