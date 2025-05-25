import { Observable, of } from "rxjs";
import { catchError, map, startWith } from "rxjs/operators";
import { LoadingState } from "./loading-state.interface";

export function toLoadingStateStream<T>(
  source$: Observable<T>,
): Observable<LoadingState<T>> {
  return source$.pipe(
    map((data): LoadingState<T> => ({ state: 'loaded', data })),
    catchError((error): Observable<LoadingState<T>> =>
      of({ state: 'error', error })
    ),
    startWith({ state: 'loading' } as LoadingState<T>)
  );
}