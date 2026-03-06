import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth/auth';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.css',
})
export class ConfirmEmail implements OnInit {
  isLoading = true;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const token = params['token'];

      if (token) {
        this.authService.confirmEmail(token).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.isSuccess = true;
          },
          error: (err) => {
            this.isLoading = false;
            this.isSuccess = false;
            this.errorMessage = err.error?.message || 'Verification failed. The link might be expired.';
          }
        });
      } else {
        this.isLoading = false;
        this.errorMessage = 'Invalid confirmation token.';
      }
    });
  }
}