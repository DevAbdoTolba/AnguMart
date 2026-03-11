import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// استيراد الموديلز اللي جات من برانش الـ Categories
import { 
  ProductDetailResponse, 
  ProductListResponse, 
  ProductQueryParams 
} from '../models/product.model';

export interface Product {
  _id?: string;
  name: string;
  price: number;
  stock: number;
  category: any;
  description?: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  
  // استخدمنا الـ environment عشان يبقى الكود احترافي
  private readonly apiUrl = `${environment.apiUrl}/products`;
  // دي الـ URL اللي بنستخدمها في الـ Admin Dashboard
  private readonly adminApiUrl = 'http://localhost:3000/api/admin';

  // ==========================================================
  // 1. PRODUCT METHODS (CRUD & FETCHING)
  // ==========================================================

  getAllProducts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getProducts(params?: ProductQueryParams): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof ProductQueryParams] !== undefined && params[key as keyof ProductQueryParams] !== null) {
          httpParams = httpParams.append(key, String(params[key as keyof ProductQueryParams]));
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // الميثود دي زيادة لزوم الـ Dashboard
  getAdminProducts(): Observable<any> {
    return this.http.get<any>(`${this.adminApiUrl}/products`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==========================================================
  // 2. DASHBOARD STATS
  // ==========================================================
  
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.adminApiUrl}/stats`);
  }
}