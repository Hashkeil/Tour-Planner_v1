import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    const success = this.authService.login(this.email, this.password);

    if (success) {
      this.message = 'Login successful!';
      this.router.navigate(['/dashboard']);
    } else {
      this.message = 'Invalid email or password.';
    }
  }
}
