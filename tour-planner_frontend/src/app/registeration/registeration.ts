import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registeration.html',
  styleUrl: './registeration.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  loading = false;

  onRegister(): void {
    if (this.loading) {
      return;
    }

    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.message = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.message = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.register(this.email, this.username, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.message = 'Registration failed. Email may already be in use.';
        }
      },
      error: () => {
        this.loading = false;
        this.message = 'Registration failed. Please try again.';
      }
    });
  }
}
