import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../../core/services/user';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, DecimalPipe, TitleCasePipe],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsers implements OnInit {
  private router = inject(Router); 
  private userService = inject(User);

  // السجنالز الأساسية
  users = signal<any[]>([]); 
  searchTerm = signal('');
  currentPage = signal(1);
  totalResults = signal(0); // بنسجل فيه عدد المستخدمين الكلي اللي راجع من الباك

  // حساب العدد الإجمالي للبيانات المعروضة حالياً
  totalUsers = computed(() => this.users().length);

  // منطق البحث
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allUsers = this.users();
    if (!term) return allUsers;
    
    return allUsers.filter(u => 
      (u.name?.toLowerCase().includes(term)) || 
      (u.email?.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.loadUsers(this.currentPage());
  }

  // جلب البيانات مع دعم الـ Pagination
  loadUsers(page: number): void {
    this.userService.getUsers(page).subscribe({
      next: (res) => {
        // الباك إند بتاعك بيبعت البيانات في res.data والعدد في res.results
        this.users.set(res.data || []); 
        this.totalResults.set(res.results || 0);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        // لو الـ Token باظ أو خلص (401/403) نرجعه للـ Login
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  viewProfile(userId: any) {
    // التأكد إننا بنبعت الـ _id بتاع مونجو
    if (userId) {
      this.router.navigate(['/dashboard/user-profile', userId]);
    }
  }

  updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  toggleBlock(user: any) {
    // بنحدث الحالة محلياً فوراً عشان الـ UI يحس
    const updatedUsers = this.users().map(u => {
      if (u._id === user._id) {
        return { 
          ...u, 
          isBlocked: !u.isBlocked, 
          status: !u.isBlocked ? 'Restricted' : 'Approved' 
        };
      }
      return u;
    });
    
    this.users.set(updatedUsers);
    
    // TODO: هنا المفروض تنادي على API الـ status اللي في الباك
    console.log(`User ${user.name} status updated locally.`);
  }

  goToPage(page: number, event?: Event) {
    if (event) event.preventDefault(); 
    
    if (page >= 1 && page !== this.currentPage()) { 
      this.currentPage.set(page);
      this.loadUsers(page); 
    }
  }
}