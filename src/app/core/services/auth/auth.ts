import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  confirmEmail(token: string): Observable<any> {
const secureToken = encodeURIComponent(token);
  return this.http.get(`${this.baseUrl}/confirmEmail/${secureToken}`);  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
}