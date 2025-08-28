import { CanActivateFn } from '@angular/router';

export const validateLinkGuard: CanActivateFn = (route, state) => {
  // const data$ = this.authService.submitRegistrationForm(
  //   this.user().email,
  //   this.user().password
  // );
  // this.data$.subscribe({
  //   next: (value) => {
  //     console.log('value', value);
  //     this.toast.success('Registered successfully');
  //     this.router.navigate(['auth']);
  //   },
  //   error: (err) => {
  //     console.log('err at sign up: ', err);
  //     this.toast.error(err.message);
  //   },
  // });
  return true;
};
