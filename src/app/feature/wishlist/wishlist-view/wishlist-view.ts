import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { Navbar } from '../../../layout/navbar/navbar';

@Component({
  selector: 'app-wishlist-view',
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './wishlist-view.html',
  styles: `
    .wishlist-card {
      background-color: #1a1a1a;
      border: 1px solid #333;
      transition: all 0.2s ease-in-out;
    }
    .wishlist-card:hover {
      border-color: #1DB954;
      transform: translateY(-2px);
    }
  `,
})
export class WishlistView implements OnInit, OnDestroy {
  wishlistItems: any[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Track adding stuff explicitly
  loadingProductIds = new Set<string>();

  private wishlistSub!: Subscription;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.fetchWishlist();
  }

  ngOnDestroy(): void {
    if (this.wishlistSub) {
      this.wishlistSub.unsubscribe();
    }
  }

  fetchWishlist(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.wishlistSub = this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        // The wishlist `GET` returns populated object wrappers like:
        // { _id: "wishlist1", productId: { _id: "realProductId", name: "foo" } }
        // For the UI cards to render correctly, map directly down to the product object.
        this.wishlistItems = response.data.data.map((item: any) => 
          item.productId && typeof item.productId === 'object' ? item.productId : item
        );
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load wishlist:', err);
        this.errorMessage = 'Could not load your wishlist. Please try again.';
        this.isLoading = false;
      }
    });
  }

  removeFromWishlist(productId: string): void {
    this.loadingProductIds.add(productId);
    
    // Optimistically remove from view
    const itemIndex = this.wishlistItems.findIndex(i => i._id === productId);
    const itemBackup = this.wishlistItems[itemIndex];
    this.wishlistItems.splice(itemIndex, 1);
    
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.loadingProductIds.delete(productId);
      },
      error: (err) => {
        console.error('Failed to remove item:', err);
        // Revert UI automatically if network request failed
        this.wishlistItems.splice(itemIndex, 0, itemBackup);
        this.loadingProductIds.delete(productId);
      }
    });
  }

  moveToCart(product: any): void {
    if (this.loadingProductIds.has(product._id)) return;
    this.loadingProductIds.add(product._id);

    // 1. Add to Cart
    this.cartService.addItem(product._id, 1).subscribe({
      next: () => {
        // 2. Remove From Wishlist automatically upon success
        this.removeFromWishlist(product._id);
      },
      error: (err) => {
        console.error('Failed to add to cart:', err);
        this.loadingProductIds.delete(product._id);
        alert(err.error?.message || 'Could not add to cart.');
      }
    });
  }
}
