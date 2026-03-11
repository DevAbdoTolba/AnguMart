import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('angumart_token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    // Check if the token is validly formatted
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) {
      throw new Error('Invalid token');
    }
    JSON.parse(atob(payloadSegment));
    return true;
  } catch {
    // Malformed token — redirect to login
    router.navigate(['/login']);
    return false;
  }
};
