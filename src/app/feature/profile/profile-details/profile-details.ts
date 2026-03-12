import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../layout/navbar/navbar';
import { finalize } from 'rxjs';
import { UserService, User } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar],
  templateUrl: './profile-details.html'
})
export class ProfileDetailsComponent implements OnInit {
  private userService = inject(UserService);

  // --- Signals for State Management ---
  user = signal<User | null>(null);             // Stores the user profile data
  isLoading = signal<boolean>(true);            // Tracks initial data loading state
  isSaving = signal<boolean>(false);            // Tracks the profile update process state
  error = signal<string | null>(null);          // Stores error messages if any operation fails

  // --- UI Control Signals ---
  showDeleteModal = signal<boolean>(false);     // Controls the visibility of the Bootstrap delete confirmation modal
  updateSuccess = signal<boolean>(false);       // Controls the visibility of the success alert after updating profile

  ngOnInit(): void {
    this.loadProfile();
  }

  /**
   * Fetches the current user's profile data from the backend.
   * Updates the 'user' signal on success and 'error' signal on failure.
   */
  loadProfile(): void {
    this.isLoading.set(true);
    this.userService.getMe()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.user.set(res.data),
        error: () => this.error.set('Failed to load profile data.')
      });
  }

  /**
   * Sends updated name and phone information to the server.
   * Shows a success alert temporarily upon a successful update.
   */
  onUpdateProfile(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    this.isSaving.set(true);
    this.userService.updateMe({
      name: currentUser.name,
      phone: currentUser.phone
    })
    .pipe(finalize(() => this.isSaving.set(false)))
    .subscribe({
      next: (res) => {
        this.user.set(res.data);
        // Show success alert and hide it after 3 seconds
        this.updateSuccess.set(true);
        setTimeout(() => this.updateSuccess.set(false), 3000);
      },
      error: (err) => alert(err.error?.message || 'Update failed')
    });
  }

  /**
   * Executes the final account deletion request.
   * Clears local storage and redirects the user to the login page upon success.
   */
  confirmDelete(): void {
    this.userService.deleteMe().subscribe({
      next: () => {
        localStorage.clear();
        window.location.href = '/login'; // Redirect to login page after deletion
      },
      error: (err) => alert(err.error?.message || 'Deletion failed')
    });
  }
}
