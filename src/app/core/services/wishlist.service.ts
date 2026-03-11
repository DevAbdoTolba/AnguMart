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

  getWishlist(): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(this.apiUrl).pipe(
      tap((res) => {
        // The backend `GET /api/wishlist` wraps populated products inside of `productId`.
        // e.g., [{ _id: "wishlist1", productId: { _id: "realProductId", name: "..."} }]
        const ids = new Set<string>(
          res.data.data.map((item: any) => 
            // Handle both populated objects or flat raw keys just in case
            item.productId && item.productId._id ? item.productId._id : item.productId
          )
        );
        this.wishlistIdsSubject.next(ids);
      })
    );
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
