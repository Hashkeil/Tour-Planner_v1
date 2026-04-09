import { Injectable } from '@angular/core';


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



  register(user: User): boolean {

    const users = this.getUsers();

    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {return false;}

    users.push(user);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }



  login(email: string, password: string): boolean {

    const users = this.getUsers();
    const foundUser = users.find(

      u => u.email === email && u.password === password);
    if (foundUser) {
      localStorage.setItem(this.loggedInUserKey, JSON.stringify(foundUser));
      return true;
    }

    return false;
  }


  logout(): void {
    localStorage.removeItem(this.loggedInUserKey);
  }



  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.loggedInUserKey);
  }



  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.loggedInUserKey);
    return user ? JSON.parse(user) : null;
  }


  private getUsers(): User[] {
    const users = localStorage.getItem(this.usersKey);
    return users ? JSON.parse(users) : [];
  }
}
