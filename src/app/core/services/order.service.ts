import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/orders'; // عدلي العنوان حسب الباك إند عندك

  getAllOrders(page: number = 1, limit: number = 5, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status && status !== 'All') {
      params = params.set('status', status);
    }

    return this.http.get(`${this.apiUrl}/admin/all`, { params });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/status`, { status });
  }
}