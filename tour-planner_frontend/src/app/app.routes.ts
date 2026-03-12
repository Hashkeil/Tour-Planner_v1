import { Routes } from '@angular/router';
import { RegisterComponent } from './registeration/registeration';
import { LoginComponent } from './login/login';
import {DashboardComponent} from './dashboard/dashboard';



export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];