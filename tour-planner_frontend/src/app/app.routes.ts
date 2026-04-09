import { Routes } from '@angular/router';
import { RegisterComponent } from './registeration/registeration';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { AuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { SettingsComponent } from './settings/settings.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { TourListComponent } from './tours/tour-list/tour-list.component';
import { TourDetailComponent } from './tours/tour-detail/tour-detail.component';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Protected routes
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tours', component: TourListComponent },
      { path: 'tours/:id', component: TourDetailComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'import-export', component: ImportExportComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
