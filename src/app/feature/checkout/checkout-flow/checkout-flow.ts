import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject, catchError, delay, finalize, map, of, startWith, switchMap, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CartItem } from '../../../core/models/cart.model';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

interface Address {
  id: string;
  label: string;
  details: string;
}

interface PaymentMethod {
  id: 'paypal' | 'wallet' | 'COD';
  label: string;
  description: string;
}

interface CheckoutRequest {
  paymentMethod: PaymentMethod['id'];
  address: string;
  phone: string;
}

interface CheckoutResponse {
  status?: string;
  message?: string;
  data?: any
  approvalUrl?: string;
}

@Component({
  selector: 'app-checkout-flow',
  imports: [CurrencyPipe],
  templateUrl: './checkout-flow.html',
  styleUrl: './checkout-flow.css',
})
export class CheckoutFlow {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cartService = inject(CartService);

  private readonly addressReload$ = new Subject<void>();
  private readonly cartReload$ = new Subject<void>();

  protected readonly addressLoading = signal(true);
  protected readonly addressError = signal<string | null>(null);
  protected readonly cartLoading = signal(true);
  protected readonly cartError = signal<string | null>(null);
  protected readonly submitAttempted = signal(false);
  protected readonly checkoutLoading = signal(false);
  protected readonly checkoutError = signal<string | null>(null);
  protected readonly checkoutSuccess = signal(false);
  protected readonly approvalLink = signal<string | null>(null);

  protected readonly selectedAddressId = signal<string | null>(null);
  protected readonly selectedPaymentId = signal<PaymentMethod['id'] | null>('paypal');
  protected readonly phone = signal('');

  protected readonly addresses = toSignal(
    this.addressReload$.pipe(
      startWith(void 0),
      switchMap(() => {
        this.addressLoading.set(true);
        this.addressError.set(null);
        return this.mockAddresses().pipe(
          tap(() => this.addressLoading.set(false)),
          catchError(() => {
            this.addressLoading.set(false);
            this.addressError.set('Unable to load addresses.');
            return of([] as Address[]);
          })
        );
      })
    ),
    { initialValue: [] as Address[] }
  );

  protected readonly cartItems = toSignal(
    this.cartReload$.pipe(
      startWith(void 0),
      switchMap(() => {
        this.cartLoading.set(true);
        this.cartError.set(null);
        return this.cartService.getCart().pipe(
          map((response) => response.data.data),
          tap(() => this.cartLoading.set(false)),
          catchError(() => {
            this.cartLoading.set(false);
            this.cartError.set('Unable to load cart items.');
            return of([] as CartItem[]);
          })
        );
      })
    ),
    { initialValue: [] as CartItem[] }
  );

  protected readonly subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + this.getProductPrice(item) * item.quantity, 0)
  );

  protected readonly taxRate = signal(0.14);
  protected readonly taxAmount = computed(() => this.subtotal() * this.taxRate());
  protected readonly shippingCost = computed(() => (this.cartItems().length > 0 ? 0 : 0));
  protected readonly total = computed(() => this.subtotal() + this.taxAmount() + this.shippingCost());

  protected readonly isPhoneValid = computed(() => this.phone().trim().length >= 8);

  protected readonly canPlaceOrder = computed(() =>
    this.cartItems().length > 0 && !!this.selectedAddressId() && !!this.selectedPaymentId() && this.isPhoneValid()
  );

  protected readonly addressRequirementMessage = computed(() => {
    if (!this.submitAttempted() || this.checkoutSuccess()) {
      return null;
    }
    if (this.cartItems().length === 0) {
      return 'Your cart is empty. Add at least one item to place an order.';
    }
    if (!this.selectedAddressId()) {
      return 'Select a shipping address from your profile to continue.';
    }
    if (!this.selectedPaymentId()) {
      return 'Choose a payment method to continue.';
    }
    if (!this.isPhoneValid()) {
      return 'Enter a valid phone number to continue.';
    }
    return null;
  });

  protected readonly paymentMethods: PaymentMethod[] = [
    {
      id: 'paypal',
      label: 'PayPal',
      description: 'Redirect to PayPal to complete payment',
    },
    {
      id: 'wallet',
      label: 'Wallet Balance',
      description: 'Current balance: $1,250.00',
    },
    {
      id: 'COD',
      label: 'Cash on Delivery',
      description: 'Pay when your order arrives',
    },
  ];

  constructor() {
    effect(() => {
      const addresses = this.addresses();
      if (addresses.length > 0 && !this.selectedAddressId()) {
        this.selectedAddressId.set(addresses[0].id);
      }
    });
  }

  protected selectAddress(id: string): void {
    this.selectedAddressId.set(id);
  }

  protected selectPayment(id: PaymentMethod['id']): void {
    this.selectedPaymentId.set(id);
  }

  protected retryAddresses(): void {
    this.addressReload$.next();
  }

  protected retryCart(): void {
    this.cartReload$.next();
  }

  protected placeOrder(): void {
    this.submitAttempted.set(true);
    if (!this.canPlaceOrder()) {
      return;
    }

    const selectedAddress = this.addresses().find(
      (address) => address.id === this.selectedAddressId()
    );

    const payload: CheckoutRequest = {
      paymentMethod: this.selectedPaymentId()!,
      address: selectedAddress?.details ?? '',
      phone: this.phone().trim(),
    };

    this.checkoutLoading.set(true);
    this.checkoutError.set(null);
    this.checkoutSuccess.set(false);
    this.approvalLink.set(null);

    this.http
      .post<CheckoutResponse>(`${environment.apiUrl}/cart/checkout`, payload)
      .pipe(
        finalize(() => this.checkoutLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          const message = error?.error?.message || 'Checkout failed. Please try again.';
          this.checkoutError.set(message);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        const link = response.approvalUrl ?? null;
        this.approvalLink.set(link);
        this.checkoutSuccess.set(true);
        this.cartReload$.next();
      });
  }

  protected getProduct(item: CartItem): Product | null {
    if (typeof item.productId === 'object' && item.productId !== null) {
      return item.productId as Product;
    }
    return null;
  }

  protected getProductId(item: CartItem): string {
    if (typeof item.productId === 'string') {
      return item.productId;
    }
    return (item.productId as Product)?._id ?? '';
  }

  protected getProductName(item: CartItem): string {
    return this.getProduct(item)?.name ?? 'Unknown Product';
  }

  protected getProductPrice(item: CartItem): number {
    return this.getProduct(item)?.price ?? 0;
  }

  protected getProductGradient(item: CartItem): string {
    const id = this.getProductId(item) || 'fallback';
    const palette = [
      'linear-gradient(135deg,#1a1a2e,#16213e)',
      'linear-gradient(135deg,#0f3460,#533483)',
      'linear-gradient(135deg,#2c3e50,#4ca1af)',
      'linear-gradient(135deg,#232526,#414345)',
    ];
    const index = Math.abs(this.hashCode(id)) % palette.length;
    return palette[index];
  }

  private hashCode(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private mockAddresses() {
    return of([
      {
        id: 'addr-home',
        label: 'Home',
        details: '123 Main Street, Cairo 11511, Egypt',
      },
      {
        id: 'addr-office',
        label: 'Office',
        details: '45 Tahrir Square, Floor 3, Cairo 11511, Egypt',
      },
    ] satisfies Address[]).pipe(delay(400));
  }
}
