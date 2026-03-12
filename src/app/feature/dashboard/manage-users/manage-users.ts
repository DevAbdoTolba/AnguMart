import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../../core/services/user';
import { Navbar } from '../../../layout/navbar/navbar';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, DecimalPipe, TitleCasePipe, Navbar],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css'
})
export class ManageUsers implements OnInit {
  private router = inject(Router);
  private userService = inject(User);

  users = signal<any[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);
  totalResults = signal(0);
  totalPages = signal(1);

  private readonly itemsPerPage = 5;
  private pageCache = new Map<number, any[]>();
  private maxKnownPage = 0;
  private firstEmptyPage: number | null = null;

  totalUsers = computed(() => this.users().length);

  maxPageToShow = computed(() => {
    const current = this.currentPage();
    const windowRight = 2;
    let max = current + windowRight;
    if (this.firstEmptyPage !== null) {
      max = Math.min(max, Math.max(1, this.firstEmptyPage - 1));
    }
    return Math.max(1, max);
  });

  pagesArray = computed(() => {
    const pages: number[] = [];
    const window = 2; // 2 left + current + 2 right
    const current = this.currentPage();
    const total = this.maxPageToShow();
    const start = Math.max(1, current - window);
    const end = Math.min(total, current + window);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

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
    this.updateEffectiveTotalPages();
    this.loadUsers(this.currentPage());
  }

  loadUsers(page: number): void {
    const cached = this.pageCache.get(page);
    if (cached) {
      this.users.set(cached);
      this.updatePaginationForPage(page, cached.length);
      this.prefetchNextTwoPages();
      return;
    }

    this.fetchPage(page, true);
  }

  viewProfile(userId: any) {
    if (userId) {
      // we don't yet have a dedicated profile page yet; navigate back to the users list
      // including the id as a param so the route exists and could be handled later
      this.router.navigate(['/dashboard/users', userId]);
    }
  }

  updateSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  toggleBlock(user: any) {
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
    console.log(`User ${user.name} status updated locally.`);
  }

  goToPage(page: number, event?: Event) {
    if (event) event.preventDefault();

    if (page >= 1 && page <= this.maxPageToShow() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.updateEffectiveTotalPages();
      this.loadUsers(page);
    }
  }

  private fetchPage(page: number, setCurrent: boolean): void {
    this.userService.getUsers(page, this.itemsPerPage).subscribe({
      next: (res) => {
        const data = res?.data?.data || res?.data || [];
        const users = Array.isArray(data) ? data : [];
        const pageResults = users.length;

        this.pageCache.set(page, users);

        if (pageResults === 0) {
          this.firstEmptyPage = this.firstEmptyPage
            ? Math.min(this.firstEmptyPage, page)
            : page;
          this.updateEffectiveTotalPages();
          if (setCurrent && page > 1) {
            this.currentPage.set(page - 1);
            this.loadUsers(this.currentPage());
          }
          return;
        }

        this.maxKnownPage = Math.max(this.maxKnownPage, page);
        if (pageResults < this.itemsPerPage) {
          const emptyAfter = page + 1;
          this.firstEmptyPage = this.firstEmptyPage
            ? Math.min(this.firstEmptyPage, emptyAfter)
            : emptyAfter;
        }

        if (setCurrent) {
          this.users.set(users);
          this.totalResults.set(res?.results || 0);
          this.updatePaginationForPage(page, pageResults);
          this.prefetchNextTwoPages();
        } else {
          this.updateEffectiveTotalPages();
        }
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private updatePaginationForPage(page: number, pageResults: number): void {
    if (pageResults === 0) {
      this.firstEmptyPage = this.firstEmptyPage
        ? Math.min(this.firstEmptyPage, page)
        : page;
    } else {
      this.maxKnownPage = Math.max(this.maxKnownPage, page);
      if (pageResults < this.itemsPerPage) {
        const emptyAfter = page + 1;
        this.firstEmptyPage = this.firstEmptyPage
          ? Math.min(this.firstEmptyPage, emptyAfter)
          : emptyAfter;
      }
    }
    this.updateEffectiveTotalPages();
  }

  private updateEffectiveTotalPages(): void {
    const windowRight = 2;
    let inferred = Math.max(this.maxKnownPage, this.currentPage() + windowRight);
    if (this.firstEmptyPage !== null) {
      inferred = Math.min(inferred, Math.max(1, this.firstEmptyPage - 1));
    }
    this.totalPages.set(Math.max(1, inferred));
  }

  private prefetchNextTwoPages(): void {
    const next1 = this.currentPage() + 1;
    const next2 = this.currentPage() + 2;

    if (this.firstEmptyPage !== null && next1 >= this.firstEmptyPage) return;

    if (!this.pageCache.has(next1)) {
      this.fetchPage(next1, false);
    }
    if (!this.pageCache.has(next2)) {
      this.fetchPage(next2, false);
    }
  }
}
