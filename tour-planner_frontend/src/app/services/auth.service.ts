import { Injectable } from '@angular/core';

/*
Definiert die Struktur eines Benutzers.
*/
export interface User {
  username: string;
  email: string;
  password: string;
}


//Service in der ganzen Application verfügbar ist.
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Schlüssel für gespeicherte Benutzer im localStorage
  private readonly usersKey = 'users';
  private readonly loggedInUserKey = 'loggedInUser';


  /*
  Registriert einen neuen Benutzer.
  Prüft zuerst, ob ein Benutzer mit derselben Email bereits existiert.
  */
  register(user: User): boolean {

    const users = this.getUsers();

    // Sucht nach einem Benutzer mit gleicher Email
    const existingUser = users.find(u => u.email === user.email);

    // Wenn Benutzer existiert → Registrierung abbrechen
    if (existingUser) {
      return false;
    }

    // Neuen Benutzer speichern
    users.push(user);
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    return true;
  }


  /*
  Prüft Login-Daten (Email und Passwort).
  Wenn ein passender Benutzer gefunden wird → Login erfolgreich.
  */
  login(email: string, password: string): boolean {

    const users = this.getUsers();

    // Sucht Benutzer mit passender Email und Passwort
    const foundUser = users.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {

      // Benutzer als eingeloggt speichern
      localStorage.setItem(this.loggedInUserKey, JSON.stringify(foundUser));

      return true;
    }

    return false;
  }


  /*
  Logout: Entfernt den eingeloggten Benutzer aus dem localStorage.
  */
  logout(): void {
    localStorage.removeItem(this.loggedInUserKey);
  }


  /*
  Prüft, ob ein Benutzer aktuell eingeloggt ist.
  */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.loggedInUserKey);
  }


  /*
  Gibt den aktuell eingeloggten Benutzer zurück.
  */
  getCurrentUser(): User | null {

    const user = localStorage.getItem(this.loggedInUserKey);

    return user ? JSON.parse(user) : null;
  }


  /*
  Lädt alle registrierten Benutzer aus dem localStorage.
  */
  private getUsers(): User[] {

    const users = localStorage.getItem(this.usersKey);

    // Wenn keine Benutzer gespeichert sind, wird ein leeres Array zurückgegeben
    return users ? JSON.parse(users) : [];
  }
}
