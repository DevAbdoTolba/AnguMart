import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private readonly API_URL = 'http://localhost:3000/api/products';

  getAllProducts(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(this.API_URL, product);
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}