import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styles: [`
    .nav-link { transition: all 0.2s ease-in-out; border-left: 4px solid transparent; }
    .nav-link:hover { background-color: rgba(255, 255, 255, 0.05); color: #198754 !important; }
    .active-link { 
      background-color: rgba(255, 255, 255, 0.1) !important; 
      border-left: 4px solid #198754 !important; 
      color: white !important; 
    }
  `]
})
export class Sidebar implements OnInit {
  // دمجنا الـ inputs كلها هنا بدون تكرار
  title = input<string>('AnguMart');
  clearLabel = input<string>('Clear All');
  showClear = input<boolean>(true);

  adminName = signal<string>('Admin');
  clearClicked = output<void>();

  ngOnInit() {
    this.getAdminName();
  }

  onClear(): void {
    this.clearClicked.emit();
  }

  getAdminName() {
    try {
      // جلب اسم الأدمن من الـ Token المخزن
      const token = localStorage.getItem('userToken') || localStorage.getItem('angumart_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const name = payload.data?.name || payload.name || 'Admin';
        this.adminName.set(name);
      }
    } catch (e) {
      console.error('Error parsing token', e);
      this.adminName.set('Admin');
    }
  }
}