import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./auth/register/register').then(m => m.Register), canActivate: [guestGuard] },

  // Flattened Protected Layout Wrapper
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list').then(m => m.ProjectList),
        canActivate: [roleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail/project-detail').then(m => m.ProjectDetail),
        canActivate: [roleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/task-list/task-list').then(m => m.TaskList)
      },
      {
        path: 'tasks/:id',
        loadComponent: () => import('./features/tasks/task-detail/task-detail').then(m => m.TaskDetail)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list/user-list').then(m => m.UserList),
        canActivate: [roleGuard],
        data: { role: 'admin' }
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent)
      }
    ]
  },
  { 
    path: '**', 
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFoundComponent) 
  }
];
