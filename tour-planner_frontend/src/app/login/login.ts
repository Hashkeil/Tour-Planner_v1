import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  message = '';
  loading = false;

  onLogin(): void {
    if (!this.email || !this.password) {
      this.message = 'Please enter email and password.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.loading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.message = 'Invalid email or password.';
        }
      }
    });
  }
}
