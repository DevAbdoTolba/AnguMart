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

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  restoreReview(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { isDeleted: false });
  }
}