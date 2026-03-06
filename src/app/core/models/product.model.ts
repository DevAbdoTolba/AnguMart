export interface Product {
  _id: string;
  name: string;
  price: number;
  stock?: number;
  ratingsAverage?: number;
  createdAt?: string;
  updatedAt?: string;
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
