import { Component } from '@angular/core';
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

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';

  constructor(
    //bessere aus auf inject-Funktion außerhalb von Konstruktor
    private authService: AuthService,
    private router: Router
  ) {}



  onRegister(): void {

    // Prüfen ob alle Felder ausgefüllt sind
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.message = 'Please fill in all fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    const success = this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password
    });


    if (success) {
      this.router.navigate(['/login']);
    } else {
      this.message = 'User already exists.';
    }
  }
}