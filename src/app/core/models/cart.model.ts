import { Product } from './product.model';

export interface CartItem {
  productId: Product | string;
  quantity: number;
  _id?: string;
}

export interface CartResponse {
  status: string;
  data: {
    data: CartItem[];
  };
}

export interface CartMutationResponse {
  status: string;
  data: {
    message: string;
    token?: string;
    isGuestCreated?: boolean;
    data: {
      cart: CartItem[];
    };
  };
}
