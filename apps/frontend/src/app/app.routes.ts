import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.Login)
  },
  {
    path: 'movies',
    canActivate: [authGuard],
    loadComponent: () => import('./features/movies/movies').then(m => m.Movies)
  },
  { path: '**', redirectTo: 'movies' }
];
