import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/reviews';

  getAllReviews(page: number = 1, limit: number = 5, search: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (search) {
      params = params.set('name', search);
    }
    return this.http.get<any>(`${this.apiUrl}/all-admin`, { params });
  }

  getProductReviews(productId: string, page: number = 1, limit: number = 5): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString()).set('product', productId);
    return this.http.get<any>(`${this.apiUrl}/${productId}`, { params });
  }

  getUserReviewForProduct(productId: string, userId: string): Observable<any> {
    const params = new HttpParams().set('product', productId).set('user', userId);
    return this.http.get<any>(this.apiUrl, { params });
  }

  canReview(productId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/can-review/${productId}`);
  }

  createReview(productId: string, title: string, review: string, ratings: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, { product: productId, title, review, ratings });
  }

  updateReview(reviewId: string, review: string, ratings: number, title?: string): Observable<any> {
    const payload: any = { review, ratings };
    if (title) payload.title = title;
    return this.http.patch<any>(`${this.apiUrl}/${reviewId}`, payload);
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  restoreReview(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { isDeleted: false });
  }
}
