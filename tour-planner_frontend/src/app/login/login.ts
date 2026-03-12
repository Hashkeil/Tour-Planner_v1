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

  // Variablen für die Eingabe der E-Mail und des Passworts sowie für die Anzeige von Fehlermeldungen
  email = '';
  password = '';
  message = '';

  constructor(
    // AuthService wird injiziert, um Login-Logik auszuführen
    private authService: AuthService,

    // Router wird verwendet, um nach erfolgreichem Login zu einer anderen Seite zu navigieren
    private router: Router
  ) {}

  // Diese Methode wird ausgeführt, wenn der Benutzer auf den Login-Button klickt
  onLogin(): void {

    // 1️ Einfache Validierung:
    // Prüfen, ob beide Felder ausgefüllt sind
    if (!this.email || !this.password) {

      // Falls ein Feld leer ist, zeigen wir eine Fehlermeldung
      this.message = 'Please enter email and password.';

      // Methode wird beendet
      return;
    }

    // 2️ Authentifizierung:
    // AuthService überprüft, ob ein Benutzer mit dieser E-Mail und Passwort existiert
    const success = this.authService.login(this.email, this.password);

    // 3️ Ergebnis auswerten
    if (success) {

      // Wenn Login erfolgreich ist,
      // navigieren wir zur Dashboard-Seite
      this.router.navigate(['/dashboard']);

    } else {

      // Wenn Login fehlschlägt,
      // zeigen wir eine Fehlermeldung im UI
      this.message = 'Invalid email or password.';
    }
  }
}
