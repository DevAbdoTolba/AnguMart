import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CartItem, CartMutationResponse, CartResponse } from '../models/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;
  private readonly TOKEN_KEY = 'angumart_token';

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY);
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('token', token);
    }
    return headers;
  }

  private storeToken(response: CartMutationResponse): void {
    if (response.data?.token) {
      localStorage.setItem(this.TOKEN_KEY, response.data.token);
    }
  }

  getCart(): Observable<CartResponse> {
    return this.http
      .get<CartResponse>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(tap((res) => this.cartItemsSubject.next(res.data.data)));
  }

  addItem(productId: string, quantity: number): Observable<CartMutationResponse> {
    return this.http
      .post<CartMutationResponse>(this.apiUrl, { productId, quantity }, { headers: this.getHeaders() })
      .pipe(
        tap((res) => {
          this.storeToken(res);
          this.cartItemsSubject.next(res.data.data.cart);
        })
      );
  }

  updateItemQuantity(itemId: string, quantity: number): Observable<CartMutationResponse> {
    return this.http
      .patch<CartMutationResponse>(`${this.apiUrl}/${itemId}`, { quantity }, { headers: this.getHeaders() })
      .pipe(tap((res) => this.cartItemsSubject.next(res.data.data.cart)));
  }

  deleteItem(itemId: string): Observable<CartMutationResponse> {
    return this.http
      .delete<CartMutationResponse>(`${this.apiUrl}/${itemId}`, { headers: this.getHeaders() })
      .pipe(tap((res) => this.cartItemsSubject.next(res.data.data.cart)));
  }

  get cartCount(): number {
    return this.cartItemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }
}
