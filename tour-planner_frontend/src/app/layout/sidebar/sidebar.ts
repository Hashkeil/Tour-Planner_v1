import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  collapsed  = signal(false);
  mobileOpen = signal(false);
  isMobile   = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.checkMobile();
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobile.set(window.innerWidth <= 768);
    // auto-close mobile drawer on resize to desktop
    if (!this.isMobile()) this.mobileOpen.set(false);
  }

  get username(): string {
    return this.authService.getCurrentUser()?.username ?? '';
  }

  toggleSidebar(): void {
    this.collapsed.update(v => !v);
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
