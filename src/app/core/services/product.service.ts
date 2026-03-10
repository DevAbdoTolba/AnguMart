import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
// Ensure these imports point to your actual model file paths
import { 
  ProductDetailResponse, 
  ProductListResponse, 
  ProductQueryParams 
} from '../models/product.model';

// Note: It is best practice to move this interface into your product.model.ts file, 
// but you can keep it here if you prefer to match the second developer's setup.
export interface Product {
  _id?: string;
  name: string;
  price: number;
  stock: number;
  category: any;
  description?: string;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Using the modern inject() approach from the second file
  private http = inject(HttpClient);
  
  // Unified to use the environment URL from the first file (No hardcoded localhost!)
  private readonly apiUrl = `${environment.apiUrl}/products`;

  // ==========================================================
  // 1. PUBLIC STOREFRONT (Fetching, Filtering, Pagination)
  // ==========================================================

  getProducts(queryParams?: ProductQueryParams): Observable<ProductListResponse> {
    let params = new HttpParams();

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<ProductListResponse>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.apiUrl}/${id}`);
  }

  // ==========================================================
  // 2. ADMIN MANAGEMENT (CRUD Operations)
  // ==========================================================

  getAllProducts(): Observable<any> {
    // Note: This does the exact same HTTP call as getProducts() without params.
    // Kept separate as 'any' so it doesn't break the ManageProductsComponent's expected response.
    return this.http.get<any>(this.apiUrl);
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
}