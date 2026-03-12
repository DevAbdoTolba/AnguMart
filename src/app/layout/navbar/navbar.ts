import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-navbar',
  // NgIf / NgFor etc. come from CommonModule; RouterLink used for links.
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  brandName = input<string>('AnguMart');
  searchPlaceholder = input<string>('Search products...');
  searchValue = input<string>('');

  searchChanged = output<string>();

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChanged.emit(value);
  }

  // use a getter so it reads more naturally in templates (<span *ngIf="navbar.isLoggedIn">)
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('angumart_token');
  }

  logout(): void {
    localStorage.removeItem('angumart_token');
    // refresh so guards can re-evaluate and page state resets
    window.location.reload();
  }

  /**
   * Simple jwt decoder to check if the user has an admin role.
   * Assumes token stored under angumart_token with { data:{role:'admin'} } or similar.
   */
  isAdmin(): boolean {
    const token = localStorage.getItem('angumart_token');
    if (!token) return false;

    // helper to turn base64url (JWT) into valid base64 string for atob
    const base64urlToBase64 = (str: string) =>
      str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - (str.length % 4)) % 4, '=');

    try {
      const payloadSegment = token.split('.')[1];
      if (!payloadSegment) return false;
      const cleaned = base64urlToBase64(payloadSegment);
      const decoded = JSON.parse(atob(cleaned));
      const role = decoded?.data?.role || decoded?.role;
      return role === 'admin' || role === 'super-admin';
    } catch {
      // if decoding fails, treat user as non‑admin silently
      return false;
    }
  }
}
