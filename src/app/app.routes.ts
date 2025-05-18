import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import path from 'path';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthIndexComponent } from './auth-index/auth-index.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Musically | Home',
  },
  {
    path: 'auth',
    component: AuthComponent,
    title: 'Musically | Auth',
    children: [
      {
        path: '',
        component: AuthIndexComponent,
        title: 'Musically | Auth',
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'Musically | Login',
      },
      {
        path: 'register',
        component: RegisterComponent,
        title: 'Musically | Register',
      },
    ],
  },
];
