import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  
  private apiUrl = environment.apiUrl; 

  /**
   * جلب إحصائيات المتجر (الإيرادات والطلبات)
   */
  getStoreStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`).pipe(
      map(response => response.data)
    );
  }

  /**
   * جلب كل المستخدمين (لأغراض الإحصائيات)
   */
  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/users`);
  }

  /**
   * جلب كل طلبات النظام (للأدمن فقط)
   * تم تعديل المسار بناءً على الـ Order Routes الخاصة بك
   */
  getAllOrders(): Observable<any> {
    // المسار الصحيح كما هو محدد في router.get("/admin/all", ...)
    return this.http.get<any>(`${this.apiUrl}/orders/admin/all`);
  }
}