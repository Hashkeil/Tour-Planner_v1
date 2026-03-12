import { Component } from '@angular/core';
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

  // Variablen für die Eingabe und die Fehlermeldung
  email = '';
  password = '';
  message = '';

  constructor(
    //bessere aus auf inject-Funktion außerhalb von Konstruktor
    private authService: AuthService,
    private router: Router
  ) {}


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