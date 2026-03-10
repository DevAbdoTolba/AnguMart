import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, catchError, delay, of, startWith, switchMap, tap } from 'rxjs';

interface Address {
  id: string;
  label: string;
  details: string;
}

interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  gradient: string;
}

interface PaymentMethod {
  id: 'paypal' | 'wallet' | 'cod';
  label: string;
  description: string;
}

@Component({
  selector: 'app-checkout-flow',
  imports: [CurrencyPipe],
  templateUrl: './checkout-flow.html',
  styleUrl: './checkout-flow.css',
})
export class CheckoutFlow {
  private readonly addressReload$ = new Subject<void>();
  private readonly cartReload$ = new Subject<void>();

  protected readonly addressLoading = signal(true);
  protected readonly addressError = signal<string | null>(null);
  protected readonly cartLoading = signal(true);
  protected readonly cartError = signal<string | null>(null);
  protected readonly submitAttempted = signal(false);

  protected readonly selectedAddressId = signal<string | null>(null);
  protected readonly selectedPaymentId = signal<PaymentMethod['id'] | null>('paypal');

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
        return this.mockCartItems().pipe(
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
    this.cartItems().reduce((sum, item) => sum + item.price * item.qty, 0)
  );

  protected readonly taxRate = signal(0.14);
  protected readonly taxAmount = computed(() => this.subtotal() * this.taxRate());
  protected readonly shippingCost = computed(() => (this.cartItems().length > 0 ? 0 : 0));
  protected readonly total = computed(() => this.subtotal() + this.taxAmount() + this.shippingCost());

  protected readonly canPlaceOrder = computed(() =>
    this.cartItems().length > 0 && !!this.selectedAddressId() && !!this.selectedPaymentId()
  );

  protected readonly addressRequirementMessage = computed(() => {
    if (!this.submitAttempted()) {
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
      id: 'cod',
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

  private mockCartItems() {
    return of([
      {
        id: 'item-1',
        name: 'Wireless Headphones',
        qty: 1,
        price: 249.99,
        gradient: 'linear-gradient(135deg,#1a1a2e,#16213e)',
      },
      {
        id: 'item-2',
        name: 'Smart Watch Series X',
        qty: 1,
        price: 399.0,
        gradient: 'linear-gradient(135deg,#0f3460,#533483)',
      },
      {
        id: 'item-3',
        name: 'Premium Cotton Hoodie',
        qty: 2,
        price: 79.5,
        gradient: 'linear-gradient(135deg,#2c3e50,#4ca1af)',
      },
    ] satisfies CartItem[]).pipe(delay(400));
  }
}
