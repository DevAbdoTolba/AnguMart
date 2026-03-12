import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Navbar } from '../../../layout/navbar/navbar';

@Component({
  selector: 'app-store-stats',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, Navbar],
  templateUrl: './store-stats.html',
  styleUrl: './store-stats.css'
})
export class StoreStats implements OnInit {
  private dashboardService = inject(DashboardService);

  adminName = signal('Admin');
  totalUsers = signal<number>(0);
  totalRevenue = signal<number>(0);
  totalOrders = signal<number>(0);

  quickActions = signal<any[]>([]);
  recentOrders = signal<any[]>([]);

  ngOnInit() {
    this.getAdminData();
    this.loadDashboardData();
  }

  getAdminData() {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('angumart_token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        if (decoded.data && decoded.data.name) {
          this.adminName.set(decoded.data.name);
        }
      }
    } catch (error) {
      console.error('Error decoding admin name:', error);
      this.adminName.set('Admin');
    }
  }

  loadDashboardData() {
    this.dashboardService.getStoreStats().subscribe({
      next: (data: any) => {
        this.totalRevenue.set(data.totalRevenue || 0);
        this.totalOrders.set(data.totalOrders || 0);
      },
      error: (err: any) => console.error('Error fetching stats:', err)
    });

    this.dashboardService.getAllUsers().subscribe({
      next: (res: any) => {
        this.totalUsers.set(res.results || 0);
      },
      error: (err: any) => console.error('Error fetching user count:', err)
    });

    this.dashboardService.getAllOrders().subscribe({
      next: (res: any) => {
        // Essential Change: Accessing res.data.data based on your API structure
        const ordersArray = res.data?.data || res.data || [];

        if (Array.isArray(ordersArray)) {
          const mappedOrders = ordersArray
            .slice(0, 5)
            .map((order: any) => ({
              id: order._id ? order._id.substring(order._id.length - 6).toUpperCase() : 'N/A',
              customer: order.user?.name || 'Guest User',
              total: order.totalPrice || 0,
              status: order.status || 'Pending',
              date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'
            }));

          this.recentOrders.set(mappedOrders);
        }
      },
      error: (err: any) => console.error('Error fetching admin orders:', err)
    });

    this.quickActions.set([
      { title: 'Add Product', desc: 'Create new listing', icon: 'bi bi-box-seam', link: '/dashboard/products' },
      { title: 'Manage Orders', desc: 'Check latest orders', icon: 'bi bi-receipt', link: '/dashboard/orders' },
      { title: 'View Users', desc: 'Manage registered users', icon: 'bi bi-people', link: '/dashboard/users' },
      { title: 'Reviews', desc: 'Check feedback', icon: 'bi bi-star', link: '/dashboard/reviews' }
    ]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Delivered': return 'text-bg-success-muted text-success';
      case 'Pending': return 'text-bg-warning-muted text-warning';
      case 'Shipped': return 'text-bg-info-muted text-info';
      case 'Cancelled': return 'text-bg-danger-muted text-danger';
      default: return 'bg-secondary text-white';
    }
  }
}
