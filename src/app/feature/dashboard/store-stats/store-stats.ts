import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-store-stats',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './store-stats.html',
  styleUrl: './store-stats.css'
})
export class StoreStats implements OnInit {
  // private dashboardService = inject(DashboardService); 

  adminName = signal('Nesma');
  
  stats = signal<any[]>([]);
  quickActions = signal<any[]>([]);
  recentOrders = signal<any[]>([]);

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // API call to fetch stats, quick actions, and recent orders
    //: this.dashboardService.getStats().subscribe(data => this.stats.set(data));
    
   this.quickActions.set([
  { title: 'Add Product', desc: 'Create new listing', icon: 'bi bi-box-seam', link: '/dashboard/products' },
  { title: 'Manage Orders', desc: '12 pending', icon: 'bi bi-receipt', link: '/dashboard/orders' },
  { title: 'View Users', desc: '3,582 registered', icon: 'bi bi-people', link: '/dashboard/users' },
  { title: 'Reviews', desc: '5 flagged', icon: 'bi bi-star', link: '/dashboard/reviews' }
]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Delivered': return 'text-bg-success-muted text-success';
      case 'Pending': return 'text-bg-warning-muted text-warning';
      case 'Shipped': return 'text-bg-info-muted text-info';
      default: return 'bg-secondary text-white';
    }
  }
}