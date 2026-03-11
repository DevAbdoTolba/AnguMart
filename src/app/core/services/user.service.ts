import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  status: 'Guest' | 'Approved' | 'Restricted' | 'Deleted' | 'Unverified';
  walletBalance: number;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  status: string;
  data: User;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  
  private readonly baseUrl = 'http://localhost:3000/api/users';

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`);
  }

   
  updateMe(data: { name: string; phone: string }): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.baseUrl}/me`, data);
  }

  
  deleteMe(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/me`);
  }
}