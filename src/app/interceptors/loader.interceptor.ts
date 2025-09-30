import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader/loader.service';
import { inject } from '@angular/core';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader: LoaderService = inject(LoaderService);
  loader.showLoader();
  return next(req).pipe(finalize(() => loader.hideLoader()));
};
