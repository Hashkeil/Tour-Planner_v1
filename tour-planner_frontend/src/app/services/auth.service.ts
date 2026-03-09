import { Injectable } from '@angular/core';

export interface User {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersKey = 'users';
  private loggedInUserKey = 'loggedInUser';

  register(user: User): boolean {
    const users = this.getUsers();

    const existingUser = users.find(u => u.email === user.email);
    if (existingUser) {
      return false; // user already exists
    }

    users.push(user);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();

    const foundUser = users.find(
      u => u.email === email && u.password === password
    );

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
