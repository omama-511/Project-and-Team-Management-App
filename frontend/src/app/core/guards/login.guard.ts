import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If there's no auth_token in local memory at all, allow access to login/register instantly
  if (!localStorage.getItem('auth_token')) {
    return true;
  }

  // If a token exists, we intercept the UI load and redirect them to their proper dashboard
  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      // If user data already exists in active memory
      if (user) {
        router.navigate([user.role === 'admin' ? '/projects' : '/tasks']);
        return of(false);
      }

      // If the page was hard-refreshed on the /login URL, we need to fetch their profile to know where to send them
      return authService.initializeAuth().pipe(
        map(fetchedUser => {
          if (fetchedUser) {
            router.navigate([fetchedUser.role === 'admin' ? '/projects' : '/tasks']);
            return false; // Blocks access to login
          }

          // If initializeAuth fails (the token was expired/invalid), let them view the login UI
          return true;
        })
      );
    })
  );
};
