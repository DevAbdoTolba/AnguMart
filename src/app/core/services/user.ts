import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class User { // تأكدي إن الاسم مطابق للي عملتيه inject في الـ component
  private http = inject(HttpClient);
  // المسار ده لازم يكون نفس اللي في الـ Node.js
private apiUrl = 'http://localhost:3000/api/admin/users';

  getUsers(page: number = 1, limit: number = 5): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}
