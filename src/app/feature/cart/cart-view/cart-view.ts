import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

@Component({
  selector: 'app-cart-view',
  imports: [CommonModule],
  templateUrl: './cart-view.html',
  styles: []
})
export class CartView implements OnInit {
  cartItems: CartItem[] = [];

  ngOnInit(): void {
    this.cartItems = [
      {
        id: '1',
        name: 'Wireless Noise-Cancel Headphones',
        price: 249.99,
        qty: 1,
        image: 'https://picsum.photos/seed/headphones/150/150'
      },
      {
        id: '2',
        name: 'Smart Watch Series X',
        price: 399.00,
        qty: 1,
        image: 'https://picsum.photos/seed/watch/150/150'
      },
      {
        id: '3',
        name: 'Premium Cotton Hoodie',
        price: 79.50,
        qty: 2,
        image: 'https://picsum.photos/seed/hoodie/150/150'
      }
    ];
  }

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  }

  get totalItemsCount(): number {
    return this.cartItems.reduce((acc, item) => acc + item.qty, 0);
  }

  decreaseQty(item: CartItem): void {
    if (item.qty > 1) {
      item.qty--;
    }
  }

  increaseQty(item: CartItem): void {
    item.qty++;
  }

  removeItem(item: CartItem): void {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
  }
}
