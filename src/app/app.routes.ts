import { Routes } from '@angular/router';
import { ValidateLinkGuard } from './guards/validate-link.guard';

export const routes: Routes = [
  {
    path: '',
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
        canActivate: [ValidateLinkGuard],
        loadComponent: () =>
          import('../app/auth/new-user/new-user.component').then(
            (m) => m.NewUserComponent
          ),
        title: 'Musically | New User',
      },
    ],
  },
];
