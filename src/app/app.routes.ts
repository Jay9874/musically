import { Routes } from '@angular/router';
import { resendLinkGuard } from './guards/resend-link.guard';
import { validateLinkGuard } from './guards/validate-link.guard';
import { resetPasswordGuard } from './guards/reset-password.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../app/home/home.component').then((m) => m.HomeComponent),
    title: 'Musically | Home',
  },
  // Users profile routes
  {
    path: 'user/:username',
    loadComponent: () =>
      import('../app/home/home.component').then((m) => m.HomeComponent),
    title: 'Musically | Home',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('../app/auth/auth.component').then((m) => m.AuthComponent),
    title: 'Musically | Auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../app/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Musically | Login',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('../app/auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'Musically | Register',
      },
      {
        path: 'new-user',
        canActivate: [validateLinkGuard],
        loadComponent: () =>
          import('../app/auth/new-user/new-user.component').then(
            (m) => m.NewUserComponent
          ),
        title: 'Musically | New User',
      },
      {
        path: 'reset-password',
        canActivate: [resetPasswordGuard],
        loadComponent: () =>
          import('../app/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
        title: 'Musically | Recovery',
      },
      {
        path: 'resend-link',
        canActivate: [resendLinkGuard],
        loadComponent: () =>
          import('../app/auth/resend-link/resend-link.component').then(
            (m) => m.ResendLinkComponent
          ),
        title: 'Musically | Resend Link',
        data: { for: 'expired_otp' },
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('../app/auth/resend-link/resend-link.component').then(
            (m) => m.ResendLinkComponent
          ),
        title: 'Musically | Forgot',
        data: { for: 'forgot_password' },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('../app/common/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: 'Musically | 404',
  },
];
