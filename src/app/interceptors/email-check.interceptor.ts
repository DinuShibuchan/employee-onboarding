import { HttpResponse, type HttpInterceptorFn } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export const emailCheckInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api/check-email')) {
    // Extract email from query params or URL
    const url = new URL(req.urlWithParams, 'http://localhost');
    const emailParam = (url.searchParams.get('email') || '').trim().toLowerCase();

    const exists = emailParam === 'admin@company.com' || emailParam === 'hr@company.com';

    return of(
      new HttpResponse({
        status: 200,
        body: { exists },
      })
    ).pipe(delay(800));
  }

  return next(req);
};
