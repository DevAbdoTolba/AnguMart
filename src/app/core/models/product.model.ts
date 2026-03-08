export interface Product {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  ratingsAverage?: number;
  description?: string;
  category?: string;
  brand?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDetailResponse {
  status: string;
  data: {
    data: Product;
  };
}

export interface ProductListResponse {
  status: string;
  results: number;
  data: {
    data: Product[];
    page: number;
    pages: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  category?: string;
  name?: string;
  [key: string]: string | number | undefined;
}
