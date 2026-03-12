import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';


/*
The AuthGuard implements the CanActivate interface, which requires the implementation of the canActivate method.
This method checks if the user is logged in by calling the isLoggedIn method of the AuthService. If the user is not logged in,
the guard redirects the user to the login page and returns false, preventing access to the protected route. If the user is logged in, it returns true, allowing access to the route.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor( private authService: AuthService,  private router: Router)
  {

  }


  canActivate(): boolean {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

