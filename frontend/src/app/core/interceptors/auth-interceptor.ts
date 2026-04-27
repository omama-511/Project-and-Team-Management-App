import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  // Clone the request to add the authentication and Accept header
  if (token) {
    const authReq = req.clone({
      headers: req.headers
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
    });
    return next(authReq);
  }

  // Pass on request without token if no token is available, but ensure JSON parsing
  const basicReq = req.clone({
    headers: req.headers.set('Accept', 'application/json')
  });
  return next(basicReq);
};
