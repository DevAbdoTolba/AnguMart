import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProductReview {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  text: string;
}

export interface ProductDetailData {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  description: string;
  reviews: ProductReview[];
}

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styles: []
})
export class ProductDetail implements OnInit {
  product!: ProductDetailData;

  ngOnInit(): void {
    this.product = {
      id: '1',
      name: 'Wireless Noise-Cancel Headphones',
      category: 'Electronics',
      price: 249.99,
      rating: 5,
      reviewsCount: 128,
      stock: 24,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      reviews: [
        {
          id: 'r1',
          author: 'Ahmed K.',
          avatar: 'A',
          date: 'Feb 15, 2026',
          rating: 5,
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        },
        {
          id: 'r2',
          author: 'Sarah M.',
          avatar: 'S',
          date: 'Feb 10, 2026',
          rating: 4,
          text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
        {
          id: 'r3',
          author: 'Mohamed R.',
          avatar: 'M',
          date: 'Jan 28, 2026',
          rating: 5,
          text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'
        }
      ]
    };
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}
