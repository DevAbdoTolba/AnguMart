import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface WishlistResponse {
  status: string;
  results: number;
  data: {
    data: any[]; // The populated products
  };
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/wishlist`;

  private wishlistIdsSubject = new BehaviorSubject<Set<string>>(new Set());
  wishlistIds$ = this.wishlistIdsSubject.asObservable();

  constructor() {
    this.extractWishlistFromToken();
  }

  /**
   * Initializes the wishlist instantly by decoding the JWT token in localStorage.
   * This completely avoids doing an expensive `GET /api/wishlist` on page load!
   */
  private extractWishlistFromToken(): void {
    const token = localStorage.getItem('angumart_token');
    if (token) {
      try {
        const payloadStr = token.split('.')[1];
        const decoded = JSON.parse(atob(payloadStr));
        
        const wishlistArray = decoded?.data?.wishlist || [];
        // The array might contain plain objects or plain strings representing IDs
        const ids = wishlistArray.map((item: any) => 
          typeof item === 'string' ? item : item._id
        );
        
        this.wishlistIdsSubject.next(new Set<string>(ids));
      } catch (err) {
        console.error('Failed to parse wishlist state from JWT token', err);
      }
    }
  }

  addToWishlist(productId: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { productId }).pipe(
      tap(() => {
        // Optimistic-like confirmation: if successful, ensure the state reflects it
        const currentIds = this.wishlistIdsSubject.value;
        const newIds = new Set(currentIds).add(productId);
        this.wishlistIdsSubject.next(newIds);
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${productId}`).pipe(
      tap(() => {
        // Verify state removal on success
        const currentIds = this.wishlistIdsSubject.value;
        const newIds = new Set(currentIds);
        newIds.delete(productId);
        this.wishlistIdsSubject.next(newIds);
      })
    );
  }

  // Method to optimistically force the UI state temporarily while waiting
  setOptimisticState(productId: string, isAdded: boolean): void {
    const currentIds = this.wishlistIdsSubject.value;
    const newIds = new Set(currentIds);
    if (isAdded) {
      newIds.add(productId);
    } else {
      newIds.delete(productId);
    }
    this.wishlistIdsSubject.next(newIds);
  }
}
