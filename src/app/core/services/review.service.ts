import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/reviews';

  // التعديل هنا: المسار لازم يطابق الـ Route في Express
  getAllReviews(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all-admin`);
  }

  // حذف مراجعة محددة
  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}