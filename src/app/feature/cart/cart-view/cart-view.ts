import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../layout/navbar/navbar';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../../core/models/cart.model';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-view',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './cart-view.html',
  styles: []
})
export class CartView implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = true;
  errorMessage = '';
  updatingItems = new Set<string>();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.data.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        this.errorMessage = 'Failed to load your cart. Please try again.';
        this.isLoading = false;
      },
    });
  }

  getProduct(item: CartItem): Product | null {
    if (typeof item.productId === 'object' && item.productId !== null) {
      return item.productId as Product;
    }
    return null;
  }

  getProductId(item: CartItem): string {
    if (typeof item.productId === 'string') {
      return item.productId;
    }
    return (item.productId as Product)?._id ?? '';
  }

  getProductName(item: CartItem): string {
    return this.getProduct(item)?.name ?? 'Unknown Product';
  }

  getProductPrice(item: CartItem): number {
    return this.getProduct(item)?.price ?? 0;
  }

  getProductImage(item: CartItem): string {
    // prefer image url from product object if available
    const prod = this.getProduct(item);
    if (prod && prod.image) {
      return prod.image;
    }
    const id = this.getProductId(item);
    return `https://picsum.photos/seed/${id}/400/300`;
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => {
      return sum + this.getProductPrice(item) * item.quantity;
    }, 0);
  }

  get totalItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  incrementQuantity(item: CartItem): void {
    const productId = this.getProductId(item);
    if (this.updatingItems.has(productId)) return;

    this.updatingItems.add(productId);
    this.cartService.updateItemQuantity(productId, item.quantity + 1).subscribe({
      next: () => {
        item.quantity++;
        this.updatingItems.delete(productId);
      },
      error: (err) => {
        console.error('Failed to update quantity:', err);
        this.updatingItems.delete(productId);
        const msg = err.error?.message || 'Could not update quantity.';
        alert(msg);
      },
    });
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      this.removeItem(item);
      return;
    }

    const productId = this.getProductId(item);
    if (this.updatingItems.has(productId)) return;

    this.updatingItems.add(productId);
    this.cartService.updateItemQuantity(productId, item.quantity - 1).subscribe({
      next: () => {
        item.quantity--;
        this.updatingItems.delete(productId);
      },
      error: (err) => {
        console.error('Failed to update quantity:', err);
        this.updatingItems.delete(productId);
        const msg = err.error?.message || 'Could not update quantity.';
        alert(msg);
      },
    });
  }

  removeItem(item: CartItem): void {
    const productId = this.getProductId(item);
    if (this.updatingItems.has(productId)) return;

    this.updatingItems.add(productId);
    this.cartService.deleteItem(productId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (ci) => this.getProductId(ci) !== productId
        );
        this.updatingItems.delete(productId);
      },
      error: (err) => {
        console.error('Failed to remove item:', err);
        this.updatingItems.delete(productId);
        const msg = err.error?.message || 'Could not remove item.';
        alert(msg);
      },
    });
  }

  isItemUpdating(item: CartItem): boolean {
    return this.updatingItems.has(this.getProductId(item));
  }
}
