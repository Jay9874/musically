import { Routes } from '@angular/router';
import { resendLinkGuard } from './guards/resend-link.guard';
import { validateLinkGuard } from './guards/validate-link.guard';
import { resetPasswordGuard } from './guards/reset-password.guard';
import { profileGuard } from './guards/profile.guard';
import { AlbumNameResolver } from '../../utils/AlbumTitleResolver';
import { consoleGuard } from './guards/console/console.guard';
import { checkSessionGuard } from './guards/check-session.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [checkSessionGuard],
    loadComponent: () =>
      import('../app/home/home.component').then((m) => m.HomeComponent),
    title: 'Musically | Home',
    children: [
      {
        path: '',
        canActivate: [checkSessionGuard],
        loadComponent: () =>
          import(
            '../app/home/music-collections/music-collections.component'
          ).then((m) => m.MusicCollectionsComponent),
        title: 'Musically | Home',
      },
      {
        path: 'new',
        canActivate: [checkSessionGuard],
        loadComponent: () =>
          import('../app/home/new/new.component').then((m) => m.NewComponent),
        title: 'Musically | New',
      },
      {
        path: 'album/:albumid',
        pathMatch: 'full',
        canActivate: [checkSessionGuard],
        canActivateChild: [checkSessionGuard],
        loadComponent: () =>
          import('../app/common/album/album.component').then(
            (m) => m.AlbumComponent
          ),
        title: AlbumNameResolver,
      },
      {
        path: 'radio',
        canActivate: [checkSessionGuard],
        loadComponent: () =>
          import('../app/home/radio/radio.component').then(
            (m) => m.RadioComponent
          ),
        title: 'Musically | Radio',
      },
      {
        path: 'profile',
        canActivate: [profileGuard],
        loadComponent: () =>
          import('../app/home/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
        title: 'Musically | Profile',
      },
      {
        path: 'console',
        canActivate: [consoleGuard],
        canActivateChild: [consoleGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('./console/console.component').then((m) => m.ConsoleComponent),
        children: [
          { path: '', redirectTo: 'upload', pathMatch: 'full' },
          {
            path: 'upload',
            loadComponent: () =>
              import('./console/upload-song/upload-song.component').then(
                (m) => m.UploadSongComponent
              ),
            title: 'Musically | Upload',
            data: { roles: ['admin'] },
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./console/users/users.component').then(
                (m) => m.UsersComponent
              ),
            title: 'Musically | Users',
            data: { roles: ['admin'] },
          },
        ],
      },
    ],
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
