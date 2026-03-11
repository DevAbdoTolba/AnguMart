import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CartItem, CartMutationResponse, CartResponse } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  
  private readonly apiUrl = `${environment.apiUrl}/cart`;
  private readonly TOKEN_KEY = 'angumart_token';

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  // The AuthInterceptor automatically intercepts all HTTP calls and injects the 'token' header.
  
  private storeToken(response: CartMutationResponse): void {
    if (response.data?.token) {
      localStorage.setItem(this.TOKEN_KEY, response.data.token);
    }
  }

  getCart(): Observable<CartResponse> {
    return this.http
      .get<CartResponse>(this.apiUrl) // No manual headers needed!
      .pipe(tap((res) => this.cartItemsSubject.next(res.data.data)));
  }

  addItem(productId: string, quantity: number): Observable<CartMutationResponse> {
    return this.http
      .post<CartMutationResponse>(this.apiUrl, { productId, quantity }) // No manual headers needed!
      .pipe(
        tap((res) => {
          this.storeToken(res);
          this.cartItemsSubject.next(res.data.data.cart);
        })
      );
  }

  updateItemQuantity(itemId: string, quantity: number): Observable<CartMutationResponse> {
    return this.http
      .patch<CartMutationResponse>(`${this.apiUrl}/${itemId}`, { quantity }) // No manual headers needed!
      .pipe(tap((res) => this.cartItemsSubject.next(res.data.data.cart)));
  }

  deleteItem(itemId: string): Observable<CartMutationResponse> {
    return this.http
      .delete<CartMutationResponse>(`${this.apiUrl}/${itemId}`) // No manual headers needed!
      .pipe(tap((res) => this.cartItemsSubject.next(res.data.data.cart)));
  }

  get cartCount(): number {
    return this.cartItemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }
}
