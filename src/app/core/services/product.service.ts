import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ProductDetailResponse, ProductListResponse, ProductQueryParams } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

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
}
