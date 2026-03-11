import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service'; 

declare var bootstrap: any;

@Component({
  selector: 'app-manage-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-reviews.html',
  styleUrls: ['./manage-reviews.css']
})
export class ManageReviews implements OnInit {
  private reviewService = inject(ReviewService);

  paginatedReviews: any[] = [];
  allFetchedReviews: any[] = [];
  searchTerm: string = '';    
  selectedReviewId: string | null = null;
  totalReviews: number = 0;

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  ngOnInit() {
    this.loadAllReviews();
  }

  loadAllReviews() {
    this.reviewService.getAllReviews(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (res) => {
        // Did the backend paginate it?
        if (res && res.data && Array.isArray(res.data.data)) {
          this.paginatedReviews = res.data.data;
          this.totalPages = res.data.pages || Math.ceil((res.results || res.data.data.length) / this.itemsPerPage) || 1;
          this.totalReviews = res.results || res.data.data.length;
        } 
        // Backend didn't paginate or wrap it properly (returned everything)
        else if (res && Array.isArray(res.data)) {
          this.allFetchedReviews = res.data;
          this.applyFrontendFiltersAndPagination();
        } 
        else {
          this.paginatedReviews = [];
          this.totalPages = 1;
          this.totalReviews = 0;
        }
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.showToast('Failed to load reviews from server', true);
      }
    });
  }

  applyFrontendFiltersAndPagination() {
    const term = this.searchTerm.toLowerCase().trim();
    let filtered = this.allFetchedReviews;

    if (term) {
      filtered = filtered.filter(review => 
        review.user?.name?.toLowerCase().includes(term) || 
        review.product?.name?.toLowerCase().includes(term) ||
        review.review?.toLowerCase().includes(term) ||
        review.title?.toLowerCase().includes(term)
      );
    }

    this.totalReviews = filtered.length;
    this.totalPages = Math.ceil(this.totalReviews / this.itemsPerPage) || 1;

    // Adjust page bounds just in case search reduced the total pages beneath our current page
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedReviews = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onSearch() {
    this.currentPage = 1; 
    if (this.allFetchedReviews.length > 0) {
      this.applyFrontendFiltersAndPagination();
    } else {
      this.loadAllReviews();
    }
  }

  get pagesArray(): number[] {
    const array: number[] = [];
    const window = 2; // Show 2 pages before and after the current page
    const start = Math.max(1, this.currentPage - window);
    const end = Math.min(this.totalPages, this.currentPage + window);
    for (let i = start; i <= end; i++) {
        array.push(i);
    }
    return array;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAllReviews();
      window.scrollTo(0, 0); 
    }
  }

  openDeleteModal(id: string) {
    this.selectedReviewId = id;
    const modalElement = document.getElementById('deleteReviewModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmDelete() {
    if (this.selectedReviewId) {
      this.reviewService.deleteReview(this.selectedReviewId).subscribe({
        next: () => {
          this.showToast('Review Soft Deleted successfully');
          this.loadAllReviews(); 
          
          const modalElement = document.getElementById('deleteReviewModal');
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) modalInstance.hide();
          
          this.selectedReviewId = null;
        },
        error: (err) => {
          console.error('Error deleting review:', err);
          this.showToast('Could not delete this review', true);
        }
      });
    }
  }

  restoreReview(id: string) {
    this.reviewService.restoreReview(id).subscribe({
      next: () => {
        this.showToast('Review Restored successfully');
        this.loadAllReviews(); 
      },
      error: (err) => {
        console.error('Error restoring review:', err);
        this.showToast('Could not restore this review', true);
      }
    });
  }

  showToast(message: string, isError: boolean = false) {
    const toastEl = document.getElementById('reviewToast');
    if (toastEl) {
      const toastBody = toastEl.querySelector('.toast-body');
      if (toastBody) toastBody.textContent = message;
      
      toastEl.classList.remove('bg-success', 'bg-danger', 'text-white');
      toastEl.classList.add(isError ? 'bg-danger' : 'bg-success', 'text-white');
      
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  }
}
