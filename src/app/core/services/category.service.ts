import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs'; 

export interface Category {
  _id?: string;
  name: string;
  productCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/categories';

  getAllCategories(params?: any): Observable<Category[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.append(key, String(params[key]));
        }
      });
    }

    return this.http.get<any>(this.apiUrl, { params: httpParams }).pipe(
      map(res => {
        let extractedCats: Category[] = [];
        if (Array.isArray(res)) {
          extractedCats = res;
        } else if (res.data && Array.isArray(res.data)) {
          extractedCats = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          extractedCats = res.data.data;
        } else if (res.data && typeof res.data === 'object') {
           const keys = Object.keys(res.data);
           const firstArrayKey = keys.find(key => Array.isArray(res.data[key]));
           if (firstArrayKey) extractedCats = res.data[firstArrayKey];
        }
        return extractedCats;
      })
    );
  }

  createCategory(name: string): Observable<any> {
    return this.http.post(this.apiUrl, { name });
  }

  updateCategory(id: string, name: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { name });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}