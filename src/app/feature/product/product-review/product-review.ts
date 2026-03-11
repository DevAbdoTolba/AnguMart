import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-product-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-review.html',
  styleUrl: './product-review.css',
})
export class ProductReview implements OnInit {
  @Input() productId!: string;

  private reviewService = inject(ReviewService);

  reviews: any[] = [];
  myReview: any = null;
  userId: string | null = null;
  userName = 'Anonymous User';
  
  currentPage = 1;
  reviewsPerPage = 5;
  hasMoreReviews = true;
  isLoading = false;

  // Form State
  reviewTitle = '';
  reviewText = '';
  reviewRating = 0;
  
  isSubmitting = false;
  isCheckingEligibility = false;
  
  // UI Flags
  isEditing = false; 
  showReviewForm = false;
  
  submitMessage = '';
  submitError = '';

  ngOnInit() {
    this.extractUserId();
    this.loadReviews();
    if (this.userId) {
      this.checkMyReview();
    }
  }

  private extractUserId() {
    const token = localStorage.getItem('angumart_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userId = payload.data?._id || payload.id;
        this.userName = payload.data?.name || payload.name || 'Anonymous User';
      } catch (e) {}
    }
  }

  loadReviews(append = false) {
    if (this.isLoading || !this.hasMoreReviews) return;
    this.isLoading = true;

    this.reviewService.getProductReviews(this.productId, this.currentPage, this.reviewsPerPage).subscribe({
      next: (res) => {
        let fetchedReviews = res.data?.data || res.data || [];
        fetchedReviews = fetchedReviews.filter((r: any) => !r.isDeleted);
        
        // Opportunistically snag our review if we see it in the general list fetch
        if (this.userId && !this.myReview) {
            const myFetch = fetchedReviews.find((r: any) => 
               r.user === this.userId || r.user?._id === this.userId || r.user?.id === this.userId
            );
            if (myFetch) {
                this.myReview = myFetch;
                this.showReviewForm = false;
            }
        }

        if (append) {
          this.reviews = [...this.reviews, ...fetchedReviews];
        } else {
          this.reviews = fetchedReviews;
        }
        this.normalizeReviews();

        if (fetchedReviews.length < this.reviewsPerPage) {
          this.hasMoreReviews = false;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
        this.isLoading = false;
      }
    });
  }

  loadMore() {
    this.currentPage++;
    this.loadReviews(true);
  }

  private checkMyReview() {
    this.reviewService.getUserReviewForProduct(this.productId, this.userId!).subscribe({
      next: (res) => {
        const data = res.data?.data || res.data || [];
        if (data.length > 0) {
          // Strictly match to avoid stealing first element off generic queries
          this.myReview = data.find((r: any) => 
             !r.isDeleted && 
             (r.user === this.userId || r.user?._id === this.userId || r.user?.id === this.userId)
          ) || null;
          
          if (this.myReview) {
            this.showReviewForm = false;
            this.normalizeReviews();
          }
        }
      },
      error: (err) => console.log('Error checking user review state')
    });
  }

  setRating(stars: number) {
    if (!this.isSubmitting) {
      this.reviewRating = stars;
    }
  }

  startReview() {
    this.clearMessages();
    if (!this.userId) {
      this.submitError = 'Please log in to add a review.';
      return;
    }
    
    this.isCheckingEligibility = true;
    this.reviewService.canReview(this.productId).subscribe({
      next: (res) => {
        if (res?.canReview === true) {
          this.showReviewForm = true;
        } else {
          this.submitError = res?.message || 'You can only review purchased products.';
          this.showReviewForm = false;
        }
        this.isCheckingEligibility = false;
      },
      error: () => {
        this.submitError = 'Could not verify review eligibility at this moment.';
        this.isCheckingEligibility = false;
      }
    });
  }

  startEdit() {
    this.isEditing = true;
    this.showReviewForm = true;
    this.reviewTitle = this.myReview?.title || '';
    this.reviewText = this.myReview.review || '';
    this.reviewRating = this.myReview.ratings || 0;
    this.clearMessages();
  }

  cancelEdit() {
    this.isEditing = false;
    this.showReviewForm = false;
    this.reviewTitle = '';
    this.reviewText = '';
    this.reviewRating = 0;
    this.clearMessages();
  }

  submitReview() {
    this.clearMessages();
    
    if (!this.reviewTitle.trim()) {
      this.submitError = 'Please add a review title.';
      return;
    }
    if (this.reviewRating === 0) {
      this.submitError = 'Please select a star rating.';
      return;
    }
    if (!this.reviewText.trim()) {
      this.submitError = 'Please write a review text.';
      return;
    }

    this.isSubmitting = true;

    if (this.myReview && this.isEditing) {
      // UPDATE
      this.reviewService.updateReview(this.myReview._id, this.reviewText, this.reviewRating, this.reviewTitle.trim()).subscribe({
        next: (res) => {
          this.submitMessage = 'Review updated successfully!';
          this.myReview = res.data?.data || res.data;
          this.finalizeSubmit();
        },
        error: (err) => {
          this.submitError = err.error?.message || 'Could not update review. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // CREATE
      this.reviewService.createReview(this.productId, this.reviewTitle.trim(), this.reviewText, this.reviewRating).subscribe({
        next: (res) => {
          this.submitMessage = 'Review submitted successfully!';
          this.myReview = res.data?.data || res.data;
          
          // Inject our local name immediately so it doesn't say "Anonymous User" before a refresh
          if (!this.myReview.user || typeof this.myReview.user === 'string') {
             this.myReview.user = { _id: this.userId, name: this.userName };
          }

          this.finalizeSubmit();
        },
        error: (err) => {
          const message = err.error?.message || '';
          if (err.status === 403 || message.toLowerCase().includes('purchased') || message.toLowerCase().includes('bought')) {
            this.submitError = 'Reviews are only allowed if you have bought the product before.';
          } else if (err.status === 400 || message.toLowerCase().includes('already reviewed')) {
            this.submitError = 'You already reviewed this product. You can update your review.';
            this.checkMyReview();
            this.showReviewForm = false;
          } else {
            this.submitError = message || 'Could not submit review at this time.';
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteReview() {
    if (!this.myReview) return;
    if (confirm('Are you sure you want to delete your review?')) {
      this.isSubmitting = true;
      this.reviewService.deleteReview(this.myReview._id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r._id !== this.myReview._id);
          this.myReview = null;
          this.cancelEdit();
          
          this.isSubmitting = false;
          this.submitMessage = 'Your review has been successfully removed.';
          setTimeout(() => this.clearMessages(), 3500);
        },
        error: () => {
          this.isSubmitting = false;
          this.submitError = 'Failed to delete review. Please try again.';
        }
      });
    }
  }

  private finalizeSubmit() {
    this.isEditing = false;
    this.showReviewForm = false;
    this.isSubmitting = false;
    this.reviewTitle = '';
    this.reviewText = '';
    this.reviewRating = 0;
    this.normalizeReviews();
    
    // Auto-clear success message after some seconds
    setTimeout(() => this.clearMessages(), 3500);
  }

  private normalizeReviews(): void {
    if (!this.myReview) return;
    this.reviews = [
      this.myReview,
      ...this.reviews.filter((r: any) => 
         r?._id !== this.myReview._id && 
         r?.user?._id !== this.userId &&
         r?.user !== this.userId
      )
    ];
  }

  private clearMessages() {
    this.submitMessage = '';
    this.submitError = '';
  }

  getEmptyStars(rating: number) {
    return Array(5 - Math.floor(rating || 0)).fill(0);
  }

  getFilledStars(rating: number) {
    return Array(Math.floor(rating || 0)).fill(0);
  }
}
