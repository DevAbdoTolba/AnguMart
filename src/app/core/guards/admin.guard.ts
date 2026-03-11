import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('angumart_token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    // Decode the JWT payload (middle segment)
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (payload.data.role === 'admin') {
      return true;
    }

    // Not an admin — redirect to home
    router.navigate(['/']);
    return false;
  } catch {
    // Malformed token — redirect to login
    router.navigate(['/login']);
    return false;
  }
};
