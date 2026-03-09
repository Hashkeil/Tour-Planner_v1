import { Routes } from '@angular/router';
import { Registeration } from './registeration/registeration';
import { Login } from './login/login';

export const routes: Routes = [
  { path: '', component: Registeration },   // default page
  { path: 'login', component: Login }
];
