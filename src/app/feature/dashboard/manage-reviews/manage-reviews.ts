import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ReviewService } from '../../../core/services/review.service'; 

declare var bootstrap: any;

@Component({
  selector: 'app-manage-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-reviews.html',
  styleUrls: ['./manage-reviews.css']
})
export class ManageReviews implements OnInit {
  private reviewService = inject(ReviewService);

  reviews: any[] = [];
  filteredReviews: any[] = []; 
  searchTerm: string = '';    
  selectedReviewId: string | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 5; 

  ngOnInit() {
    this.loadAllReviews();
  }

  loadAllReviews() {
    this.reviewService.getAllReviews().subscribe({
      next: (res) => {
        this.reviews = res.data; 
        this.filteredReviews = res.data;
        this.currentPage = 1; 
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.showToast('Failed to load reviews from server', true);
      }
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredReviews = this.reviews;
    } else {
      this.filteredReviews = this.reviews.filter(review => 
        review.user?.name?.toLowerCase().includes(term) || 
        review.product?.name?.toLowerCase().includes(term) ||
        review.review?.toLowerCase().includes(term) ||
        review.title?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1; 
  }

  get paginatedReviews() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReviews.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReviews.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
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
          this.showToast('Review deleted successfully');
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