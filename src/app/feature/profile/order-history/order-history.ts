import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, catchError, finalize, forkJoin, map, of, startWith, switchMap, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Product } from '../../../core/models/product.model';

interface OrderItem {
  product: Product | string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  type?: string;
  totalPrice: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Completed';
  COD: boolean;
  createdAt: string;
  paypalOrderId?: string;
}

interface OrderListResponse {
  status: string;
  results: number;
  data: Order[];
}

interface OrderDetailResponse {
  status: string;
  data: Order;
}

@Component({
  selector: 'app-order-history',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  private readonly ordersReload$ = new Subject<void>();
  private readonly orderDetailRequest$ = new Subject<string>();

  protected readonly ordersLoading = signal(true);
  protected readonly ordersError = signal<string | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal<string | null>(null);
  protected readonly selectedOrderId = signal<string | null>(null);
  protected readonly productNames = signal<Record<string, string>>({});

  protected readonly orders = toSignal(
    this.ordersReload$.pipe(
      startWith(void 0),
      switchMap(() => {
        this.ordersLoading.set(true);
        this.ordersError.set(null);
        return this.http.get<OrderListResponse>(`${environment.apiUrl}/orders`).pipe(
          map((response) => response.data),
          tap(() => this.ordersLoading.set(false)),
          catchError((error) => {
            const message = error?.error?.message || 'Failed to load your orders.';
            this.ordersError.set(message);
            this.ordersLoading.set(false);
            return of([] as Order[]);
          })
        );
      })
    ),
    { initialValue: [] as Order[] }
  );

  protected readonly selectedOrder = toSignal(
    this.orderDetailRequest$.pipe(
      switchMap((orderId) => {
        this.detailLoading.set(true);
        this.detailError.set(null);
        return this.http.get<OrderDetailResponse>(`${environment.apiUrl}/orders/${orderId}`).pipe(
          map((response) => response.data),
          finalize(() => this.detailLoading.set(false)),
          catchError((error) => {
            const message = error?.error?.message || 'Failed to load order details.';
            this.detailError.set(message);
            return of(null);
          })
        );
      })
    ),
    { initialValue: null as Order | null }
  );

  protected readonly hasOrders = computed(() => this.orders().length > 0);

  constructor() {
    const routeOrderId = toSignal(
      this.route.paramMap.pipe(map((params) => params.get('id'))),
      { initialValue: null }
    );

    effect(() => {
      const orders = this.orders();
      const routeId = routeOrderId();
      if (routeId) {
        this.selectOrder(routeId);
        return;
      }
      if (orders.length > 0 && !this.selectedOrderId()) {
        this.selectOrder(orders[0]._id);
      }
    });

    effect(() => {
      const order = this.selectedOrder();
      if (!order) {
        return;
      }
      this.loadProductNames(order.items);
    });
  }

  protected refreshOrders(): void {
    this.ordersReload$.next();
  }

  protected selectOrder(orderId: string): void {
    if (this.selectedOrderId() === orderId) {
      return;
    }
    this.selectedOrderId.set(orderId);
    this.orderDetailRequest$.next(orderId);
  }

  protected getProductLabel(item: OrderItem): string {
    if (typeof item.product === 'object' && item.product !== null) {
      return item.product.name ?? 'Unknown Product';
    }
    return this.productNames()[item.product] ?? 'Loading...';
  }

  protected getProductId(item: OrderItem): string {
    if (typeof item.product === 'string') {
      return item.product;
    }
    return item.product._id ?? '';
  }

  protected getItemsCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'status-success';
      case 'Pending':
        return 'status-warning';
      case 'Shipped':
        return 'status-info';
      case 'Delivered':
        return 'status-success';
      case 'Cancelled':
        return 'status-danger';
      default:
        return 'status-muted';
    }
  }

  protected getDisplayStatus(order: Order): string {
    if (order.type === 'walletCharge') {
      return 'Completed';
    }
    return order.status;
  }

  protected getPaymentMethod(order: Order): string {
    if (order.COD) {
      return 'Cash on Delivery';
    }
    if (order.paymentStatus === 'Completed') {
      return 'PayPal';
    }
    return 'PayPal (Pending)';
  }

  private loadProductNames(items: OrderItem[]): void {
    const idsToFetch = items
      .map((item) => (typeof item.product === 'string' ? item.product : item.product._id))
      .filter((id): id is string => !!id)
      .filter((id) => !this.productNames()[id]);

    if (idsToFetch.length === 0) {
      return;
    }

    forkJoin(
      idsToFetch.map((id) =>
        this.http.get<{ data?: { data?: Product } }>(`${environment.apiUrl}/products/${id}`).pipe(
          map((response) => ({ id, name: response.data?.data?.name ?? 'Unknown Product' })),
          catchError(() => of({ id, name: 'Unknown Product' }))
        )
      )
    ).subscribe((results) => {
      const next = { ...this.productNames() } as Record<string, string>;
      for (const result of results) {
        next[result.id] = result.name;
      }
      this.productNames.set(next);
    });
  }
}
