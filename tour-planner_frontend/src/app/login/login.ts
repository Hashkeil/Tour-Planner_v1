import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Services nun durch inject() anstatt Constructor
  private authService = inject(AuthService);
  private router = inject(Router);

  // Variablen für die Eingabe und die Fehlermeldung
  email = '';
  password = '';
  message = '';


  onLogin(): void {


    if (!this.email || !this.password) {
      this.message = 'Please enter email and password.';
      return;
    }

    const success = this.authService.login(this.email, this.password);

    if (success) {
      this.router.navigate(['/dashboard']);
    } else
    {
      this.message = 'Invalid email or password.';
    }
  }
}