import { Routes } from '@angular/router';
import { RegisterComponent } from './registeration/registeration';
import { LoginComponent } from './login/login';
import {DashboardComponent} from './dashboard/dashboard';
import { AuthGuard } from './guards/auth.guard';

/*
The routes array defines the routing configuration for the Angular application. Each route is an object that specifies a path and the component that should be rendered when that path is accessed.
The canActivate property is used to protect certain routes, ensuring that only authenticated users can access them. In this case, the dashboard route is protected by the AuthGuard, which checks if the user is logged in before allowing access
 */
export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
