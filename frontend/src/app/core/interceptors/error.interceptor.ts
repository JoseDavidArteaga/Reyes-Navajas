import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor para mostrar el mensaje exacto que envía el backend en los errores.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const backendMessage =
        (error.error && (error.error.message || error.error.error)) ||
        error.message ||
        'Error inesperado';

      toastr.error(backendMessage, 'Error');

      return throwError(() => error);
    })
  );
};
