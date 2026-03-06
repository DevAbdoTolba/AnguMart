import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('userToken');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        token: token 
      }
    });
    return next(cloned);
  }

  return next(req);
};