import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';

import { environment } from '../../../../environments/environment';

interface WalletChargeResponse {
  status: string;
  data: {
    _id: string;
    totalPrice: number;
    paypalOrderId: string;
    paymentStatus: string;
  };
  approvalUrl?: string;
}

@Component({
  selector: 'app-wallet-payment',
  imports: [],
  templateUrl: './wallet-payment.html',
  styleUrl: './wallet-payment.css',
})
export class WalletPayment {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly amount = signal('');
  protected readonly submitAttempted = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly approvalUrl = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly amountValue = computed(() => Number(this.amount().trim()));
  protected readonly isAmountValid = computed(() => this.amountValue() > 0);

  protected submitRecharge(): void {
    this.submitAttempted.set(true);
    if (!this.isAmountValid()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.approvalUrl.set(null);
    this.successMessage.set(null);

    this.http
      .post<WalletChargeResponse>(`${environment.apiUrl}/cart/payments/wallet`, {
        amount: this.amountValue(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
        catchError((error) => {
          const message = error?.error?.message || 'Wallet recharge failed. Please try again.';
          this.errorMessage.set(message);
          return of(null);
        })
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }
        this.approvalUrl.set(response.approvalUrl ?? null);
        this.successMessage.set('Order created successfully.');
      });
  }
}
