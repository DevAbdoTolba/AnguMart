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
  
  currentPage = 1;
  reviewsPerPage = 5;
  hasMoreReviews = true;
  isLoading = false;

  // Form State
  reviewTitle = '';
  reviewText = '';
  reviewRating = 0;
  isSubmitting = false;
  submitMessage = '';
  submitError = '';

  isEditing = false; 
  showReviewForm = false;
  isCheckingEligibility = false;

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
        this.userId = payload.data._id;
        console.log(payload.data._id);
        
      } catch (e) {}
    }
  }

  loadReviews(append = false) {
    if (this.isLoading || !this.hasMoreReviews) return;
    this.isLoading = true;

    this.reviewService.getProductReviews(this.productId, this.currentPage, this.reviewsPerPage).subscribe({
      next: (res) => {
        // Exclude soft-deleted in UI if backend doesn't already, ensure standard robust extraction
        let fetchedReviews = res.data?.data || res.data || [];
        fetchedReviews = fetchedReviews.filter((r: any) => !r.isDeleted);
        
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
          this.myReview = data.find((r: any) => !r.isDeleted) || null;
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

  startEdit() {
    this.isEditing = true;
    this.showReviewForm = true;
    this.reviewTitle = this.myReview?.title || '';
    this.reviewText = this.myReview.review;
    this.reviewRating = this.myReview.ratings;
    this.submitMessage = '';
    this.submitError = '';
  }

  cancelEdit() {
    this.isEditing = false;
    this.showReviewForm = false;
    this.reviewTitle = '';
    this.reviewText = '';
    this.reviewRating = 0;
    this.submitMessage = '';
    this.submitError = '';
  }

  startReview() {
    this.submitError = '';
    this.submitMessage = '';
    if (!this.userId) {
      this.submitError = 'Please log in to add a review.';
      return;
    }
    this.isCheckingEligibility = true;
    this.reviewService.canReview(this.productId).subscribe({
      next: (res) => {
        const canReview = !!res?.canReview;
        if (!canReview) {
          this.submitError = 'Reviews are only allowed if you have bought the product before.';
          this.showReviewForm = false;
        } else {
          this.showReviewForm = true;
        }
        this.isCheckingEligibility = false;
      },
      error: () => {
        this.submitError = 'Could not verify review eligibility. Please try again.';
        this.isCheckingEligibility = false;
      }
    });
  }

  submitReview() {
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
    this.submitError = '';
    this.submitMessage = '';

    if (this.myReview && this.isEditing) {
      this.reviewService.updateReview(this.myReview._id, this.reviewText, this.reviewRating, this.reviewTitle.trim()).subscribe({
        next: (res) => {
          this.submitMessage = 'Review updated successfully!';
          this.myReview = res.data?.data || res.data;
          this.isEditing = false;
          this.showReviewForm = false;
          this.isSubmitting = false;
          
          const index = this.reviews.findIndex(r => r._id === this.myReview._id);
          if (index !== -1) {
             this.reviews[index] = this.myReview;
          }
          this.normalizeReviews();
        },
        error: (err) => {
          this.submitError = err.error?.message || 'Could not update review. Please try again.';
          this.isSubmitting = false;
        }
      });

    } else {
      this.reviewService.createReview(this.productId, this.reviewTitle.trim(), this.reviewText, this.reviewRating).subscribe({
        next: (res) => {
          this.submitMessage = 'Review submitted successfully!';
          this.myReview = res.data?.data || res.data;
          this.isSubmitting = false;
          this.reviewTitle = '';
          this.reviewText = '';
          this.reviewRating = 0;
          this.showReviewForm = false;
          this.normalizeReviews();
        },
        error: (err) => {
          const message = err.error?.message || '';
          if (err.status === 403 || message.toLowerCase().includes('purchased')) {
            this.submitError = 'Reviews are only allowed if you have bought the product before.';
          } else if (err.status === 400 || message.toLowerCase().includes('already reviewed')) {
            this.submitError = 'You already reviewed this product. You can edit your review.';
            if (this.userId) {
              this.checkMyReview();
            }
            this.showReviewForm = false;
          } else if (err.status === 401) {
            this.submitError = 'Please log in to add a review.';
          } else {
            this.submitError = message || 'Could not submit review. Please try again.';
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  private normalizeReviews(): void {
    if (!this.myReview) return;
    this.reviews = [
      this.myReview,
      ...this.reviews.filter((r: any) => r?._id !== this.myReview._id)
    ];
  }

  getEmptyStars(rating: number) {
    return Array(5 - Math.floor(rating || 0)).fill(0);
  }

  getFilledStars(rating: number) {
    return Array(Math.floor(rating || 0)).fill(0);
  }
}
