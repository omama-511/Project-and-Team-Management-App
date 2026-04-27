import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Read which role this path natively requires or default to admin
  const expectedRole = route.data?.['role'] || 'admin';

  return authService.currentUser$.pipe(
    take(1),
    switchMap(user => {
      // Data exists in active session
      if (user) {
        if (user.role === expectedRole) return of(true);

        router.navigate(['/tasks']);
        return of(false);
      }

      // The browser was likely refreshed. Await HTTP fetch of user profile
      return authService.initializeAuth().pipe(
        map(fetchedUser => {
          if (fetchedUser && fetchedUser.role === expectedRole) return true;

          // If user exists but isn't admin, redirect appropriately
          router.navigate(fetchedUser ? ['/tasks'] : ['/login']);
          return false;
        })
      );
    })
  );
}
