import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

/*
Diese Komponente stellt das Registrierungsformular dar.
Der Benutzer kann hier einen neuen Account erstellen.
*/
@Component({

  selector: 'app-register',
  // Standalone-Komponente (kein eigenes Angular-Modul notwendig)
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registeration.html',
  styleUrl: './registeration.css'
})
export class RegisterComponent {

  // Speichert den eingegebenen Daten des Benutzers
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  // Nachricht für Fehler oder Hinweise im UI
  message = '';

  constructor(
    // AuthService enthält die Registrierungslogik
    private authService: AuthService,
    // Router wird verwendet um zu einer anderen Seite zu navigieren
    private router: Router
  ) {}

  /*
  Diese Methode wird ausgeführt,
  wenn der Benutzer auf den "Register"-Button klickt.
  */
  onRegister(): void {

    // 1️⃣ Prüfen ob alle Felder ausgefüllt sind
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.message = 'Please fill in all fields.';
      return;
    }

    // 2️⃣ Prüfen ob beide Passwörter gleich sind
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    // 3️⃣ Registrierung über den AuthService durchführen
    const success = this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password
    });

    // 4️⃣ Ergebnis auswerten
    if (success) {

      // Wenn Registrierung erfolgreich → zur Login-Seite wechseln
      this.router.navigate(['/login']);

    } else {

      // Wenn Benutzer bereits existiert → Fehlermeldung anzeigen
      this.message = 'User already exists.';
    }
  }
}
