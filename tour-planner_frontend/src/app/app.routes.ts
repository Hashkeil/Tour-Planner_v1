import { Routes } from '@angular/router';
import { RegisterComponent } from './registeration/registeration';
import { LoginComponent } from './login/login';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then(m => m.DashboardComponent)
  },
  { path: '', redirectTo: 'register', pathMatch: 'full' }
];
