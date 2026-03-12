export interface Product {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  ratingsAverage?: number;
  description?: string;
  // backend sometimes returns an array of category names; we only care about
  // the first one. components will normalise it during data fetch.
  category?: string | string[];
  brand?: string;
  /**
   * URL to product image stored in database or CDN.
   * If absent, UI will fall back to a placeholder service (picsum).
   */
  image?: string;
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
