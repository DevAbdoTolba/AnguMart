import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../layout/navbar/navbar';

declare var bootstrap: any;

interface Order {
  _id: string;
  user: { name?: string; username?: string };
  items: any[];
  totalPrice: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
}

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar],
  templateUrl: './manage-orders.html',
  styleUrls: ['./manage-orders.css']
})
export class ManageOrders implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/orders';

  filteredOrders: Order[] = [];
  currentFilter: string = 'All';
  currentPage: number = 1;
  totalPages: number = 1;

  selectedOrderId: string | null = null;
  selectedOrderItems: any[] = [];
  selectedOrderTotal: number = 0;

  ngOnInit() {
    this.loadOrders();
  }

  showNotification(message: string, isError: boolean = false) {
    const toastEl = document.getElementById('statusToast');
    if (toastEl) {
      const toastBody = toastEl.querySelector('.toast-body');
      if (toastBody) toastBody.textContent = message;

      toastEl.classList.remove('bg-success', 'bg-danger');
      toastEl.classList.add(isError ? 'bg-danger' : 'bg-success');

      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }

  loadOrders() {
    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', '5');

    if (this.currentFilter !== 'All') {
      params = params.set('status', this.currentFilter);
    }

    this.http.get<any>(`${this.apiUrl}/admin/all`, { params }).subscribe({
      next: (res) => {
        if (res && res.data && Array.isArray(res.data.data)) {
          this.filteredOrders = res.data.data;
          if (res.data.pages) {
            this.totalPages = res.data.pages;
          }
        } else {
          this.filteredOrders = [];
        }
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.showNotification('Failed to load orders', true);
      }
    });
  }

  updateOrder(order: Order) {
    this.http.patch(`${this.apiUrl}/${order._id}/status`, { status: order.status }).subscribe({
      next: () => {
        this.showNotification(`Order #${order._id.slice(-5)} status updated!`);
        this.loadOrders();
      },
      error: (err) => {
        this.showNotification(err.error?.message || 'Update failed', true);
      }
    });
  }

  openCancelModal(id: string) {
    this.selectedOrderId = id;
    const modalElement = document.getElementById('cancelModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmCancel() {
    if (this.selectedOrderId) {
      this.http.patch(`${this.apiUrl}/${this.selectedOrderId}/status`, { status: 'Cancelled' }).subscribe({
        next: () => {
          const modalElement = document.getElementById('cancelModal');
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) modalInstance.hide();

          this.showNotification('Order has been cancelled successfully');
          this.loadOrders();
          this.selectedOrderId = null;
        },
        error: (err) => {
          this.showNotification(err.error?.message || 'Error cancelling order', true);
        }
      });
    }
  }

  applyFilter(status: string) {
    this.currentFilter = status;
    this.currentPage = 1;
    this.loadOrders();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  openItemsModal(order: Order) {
    this.selectedOrderTotal = order.totalPrice || 0;

    // Initialize items with loading state for products not populated
    this.selectedOrderItems = (order.items || []).map(i => {
      const isPopulated = typeof i.product === 'object' && i.product !== null;
      return {
        ...i,
        productId: isPopulated ? i.product._id : i.product,
        productName: isPopulated ? (i.product.name || 'Unknown Product') : 'Loading...'
      };
    });

    // Fetch details for unpopulated products
    this.selectedOrderItems.forEach(item => {
      if (item.productName === 'Loading...') {
        this.http.get<any>(`http://localhost:3000/api/products/${item.productId}`).subscribe({
          next: (res) => {
            item.productName = res.data?.data?.name || 'Unknown Product';
          },
          error: () => {
            item.productName = 'Unknown Product';
          }
        });
      }
    });

    const modalElement = document.getElementById('itemsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
