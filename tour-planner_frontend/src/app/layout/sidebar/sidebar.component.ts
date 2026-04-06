import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile overlay -->
    <div class="sidebar-backdrop"
         [class.visible]="mobileOpen() && isMobile()"
         (click)="closeMobile()">
    </div>

    <aside class="sidebar"
           [class.collapsed]="collapsed()"
           [class.mobile-open]="mobileOpen()">

      <!-- Header -->
      <div class="sidebar-header">
        <div class="logo" [class.hidden]="collapsed()">
          <span class="logo-text">Tour Planner</span>
        </div>
        <div class="logo logo-mini" [class.visible]="collapsed()">
        </div>

        <!-- Collapse toggle (desktop) -->
        <button class="toggle-btn desktop-only"
                (click)="toggleSidebar()"
                [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
                [title]="collapsed() ? 'Expand' : 'Collapse'">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path *ngIf="!collapsed()"
                  d="M10 3L5 8L10 13"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
            <path *ngIf="collapsed()"
                  d="M6 3L11 8L6 13"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Close (mobile) -->
        <button class="toggle-btn mobile-only" (click)="closeMobile()" aria-label="Close menu">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3L13 13M13 3L3 13"
                  stroke="currentColor" stroke-width="1.8"
                  stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">

        <div class="nav-section">
          <div class="nav-section-label">Navigation</div>
          <ul class="nav-list">
            <li class="nav-item" [attr.data-tooltip]="collapsed() ? 'Dashboard' : null">
              <a routerLink="/dashboard" routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: true }" class="nav-link">
                <span class="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"
                          stroke="currentColor" stroke-width="1.8"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"
                          stroke="currentColor" stroke-width="1.8"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"
                          stroke="currentColor" stroke-width="1.8"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"
                          stroke="currentColor" stroke-width="1.8"/>
                  </svg>
                </span>
                <span class="nav-text">Dashboard</span>
              </a>
            </li>
            <li class="nav-item" [attr.data-tooltip]="collapsed() ? 'My Tours' : null">
              <a routerLink="/tours" routerLinkActive="active"
                 [routerLinkActiveOptions]="{ exact: true }" class="nav-link">
                <span class="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"
                          stroke="currentColor" stroke-width="1.8"/>
                    <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.8"
                          stroke-linecap="round"/>
                    <path d="M3.6 9h.4M20 9h.4M12 3.6V4"
                          stroke="currentColor" stroke-width="1.8"
                          stroke-linecap="round"/>
                  </svg>
                </span>
                <span class="nav-text">My Tours</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="nav-divider"></div>

        <div class="nav-section">
          <div class="nav-section-label">Tools</div>
          <ul class="nav-list">
            <li class="nav-item" [attr.data-tooltip]="collapsed() ? 'Settings' : null">
              <a routerLink="/settings" routerLinkActive="active" class="nav-link">
                <span class="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                          stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>
                <span class="nav-text">Settings</span>
              </a>
            </li>
            <li class="nav-item" [attr.data-tooltip]="collapsed() ? 'Import / Export' : null">
              <a routerLink="/import-export" routerLinkActive="active" class="nav-link">
                <span class="nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" stroke-width="1.8"
                          stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                          stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </span>
                <span class="nav-text">Import / Export</span>
              </a>
            </li>
          </ul>
        </div>

      </nav>

      <!-- Footer / Logout -->
      <div class="sidebar-footer">
        <div class="nav-divider" style="margin-bottom: 12px"></div>
        <ul class="nav-list" style="padding: 0 12px">
          <li class="nav-item" [attr.data-tooltip]="collapsed() ? 'Logout' : null">
            <button class="nav-link nav-button logout-btn" (click)="logout()">
              <span class="nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                        stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <path d="M16 17l5-5-5-5M21 12H9"
                        stroke="currentColor" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="nav-text">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Mobile hamburger (outside sidebar) -->
    <button class="hamburger-fab mobile-only" (click)="openMobile()" aria-label="Open menu"
            [class.hidden]="mobileOpen()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round"/>
      </svg>
    </button>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@1&family=DM+Sans:wght@400;500;600&display=swap');

    /* ── Variables ──────────────────────────────────────── */
    :host {
      --sb-width:       256px;
      --sb-width-col:    68px;
      --sb-bg:          #0f1117;
      --sb-border:      rgba(255,255,255,0.07);
      --sb-accent:      #3a5cf5;
      --sb-accent-2:    #6c47ff;
      --sb-active-bg:   rgba(58,92,245,0.15);
      --sb-active-text: #7da4ff;
      --sb-hover-bg:    rgba(255,255,255,0.06);
      --sb-text:        rgba(255,255,255,0.55);
      --sb-text-active: rgba(255,255,255,0.95);
      --sb-label:       rgba(255,255,255,0.25);
      --sb-radius:      10px;
      --sb-transition:  0.28s cubic-bezier(0.4, 0, 0.2, 1);
      --font: 'DM Sans', system-ui, sans-serif;
    }

    /* ── Backdrop (mobile) ──────────────────────────────── */
    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(3px);
      z-index: 998;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .sidebar-backdrop.visible {
      display: block;
      opacity: 1;
    }

    /* ── Sidebar Shell ──────────────────────────────────── */
    .sidebar {
      display: flex;
      flex-direction: column;
      width: var(--sb-width);
      height: 100vh;
      background: var(--sb-bg);
      border-right: 1px solid var(--sb-border);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 999;
      transition: width var(--sb-transition);
      overflow: hidden;
      font-family: var(--font);

      /* subtle noise texture overlay */
      background-image:
        radial-gradient(ellipse 80% 60% at 50% -10%, rgba(58,92,245,0.12) 0%, transparent 70%),
        linear-gradient(180deg, #0f1117 0%, #0c0e14 100%);
    }

    .sidebar.collapsed {
      width: var(--sb-width-col);
    }

    /* ── Header ─────────────────────────────────────────── */
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px 16px;
      border-bottom: 1px solid var(--sb-border);
      min-height: 64px;
      gap: 8px;
      flex-shrink: 0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
      transition: opacity var(--sb-transition), width var(--sb-transition);
    }

    .logo.hidden {
      opacity: 0;
      width: 0;
      pointer-events: none;
    }

    .logo-mini {
      display: none;
      opacity: 0;
      transition: opacity var(--sb-transition);
    }
    .logo-mini.visible {
      display: flex;
      opacity: 1;
    }

    .logo-icon {
      font-size: 22px;
      flex-shrink: 0;
    }

    .logo-text {
      font-family: 'Syne', sans-serif;
      font-style: italic;
      font-size: 15px;
      color: rgba(255,255,255,0.9);
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    /* Toggle button */
    .toggle-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--sb-border);
      color: var(--sb-text);
      border-radius: 7px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.2s, color 0.2s, transform 0.2s;
    }

    .toggle-btn:hover {
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.9);
    }

    /* ── Nav ─────────────────────────────────────────────── */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 0 8px;
      scrollbar-width: none;
    }
    .sidebar-nav::-webkit-scrollbar { display: none; }

    .nav-section {
      padding: 0 10px;
      margin-bottom: 4px;
    }

    .nav-section-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--sb-label);
      padding: 6px 10px 6px;
      white-space: nowrap;
      overflow: hidden;
      transition: opacity var(--sb-transition);
    }

    .collapsed .nav-section-label {
      opacity: 0;
      height: 0;
      padding: 0;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    /* Tooltip for collapsed state */
    .nav-item {
      position: relative;
    }

    .nav-item[data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      background: #1e2130;
      color: rgba(255,255,255,0.9);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 7px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 9999;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      animation: tooltipIn 0.15s ease;
    }

    .nav-item[data-tooltip]:hover::before {
      content: '';
      position: absolute;
      left: calc(100% + 7px);
      top: 50%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-right-color: #1e2130;
      pointer-events: none;
      z-index: 9999;
    }

    @keyframes tooltipIn {
      from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
      to   { opacity: 1; transform: translateY(-50%) translateX(0); }
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 10px;
      border-radius: var(--sb-radius);
      text-decoration: none;
      color: var(--sb-text);
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 13.5px;
      font-weight: 500;
      font-family: var(--font);
      transition: background 0.18s ease, color 0.18s ease;
      white-space: nowrap;
      width: 100%;
      text-align: left;
      overflow: hidden;
      position: relative;
    }

    .nav-link:hover {
      background: var(--sb-hover-bg);
      color: var(--sb-text-active);
    }

    .nav-link.active {
      background: var(--sb-active-bg);
      color: var(--sb-active-text);
      font-weight: 600;
    }

    /* Left accent bar on active */
    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0; top: 20%; bottom: 20%;
      width: 2.5px;
      background: linear-gradient(180deg, var(--sb-accent) 0%, var(--sb-accent-2) 100%);
      border-radius: 2px;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      flex-shrink: 0;
      opacity: 0.8;
      transition: opacity 0.18s;
    }

    .nav-link:hover .nav-icon,
    .nav-link.active .nav-icon {
      opacity: 1;
    }

    .nav-text {
      transition: opacity var(--sb-transition);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .collapsed .nav-text {
      opacity: 0;
      width: 0;
    }

    /* Logout styling */
    .logout-btn {
      color: rgba(255,100,100,0.55);
    }
    .logout-btn:hover {
      background: rgba(232,59,90,0.1);
      color: rgba(255,100,100,0.9);
    }

    /* Divider */
    .nav-divider {
      height: 1px;
      background: var(--sb-border);
      margin: 8px 22px;
    }

    /* ── Footer ─────────────────────────────────────────── */
    .sidebar-footer {
      flex-shrink: 0;
      padding-bottom: 12px;
    }

    /* ── Mobile FAB ─────────────────────────────────────── */
    .hamburger-fab {
      display: none;
      position: fixed;
      top: 14px;
      left: 14px;
      z-index: 997;
      width: 42px;
      height: 42px;
      background: var(--sb-bg);
      border: 1px solid var(--sb-border);
      border-radius: 11px;
      color: rgba(255,255,255,0.75);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      transition: opacity 0.2s, transform 0.2s;
    }

    .hamburger-fab.hidden {
      opacity: 0;
      pointer-events: none;
    }

    /* ── Responsive ─────────────────────────────────────── */
    .desktop-only { display: flex; }
    .mobile-only  { display: none; }

    @media (max-width: 768px) {
      .desktop-only { display: none; }
      .mobile-only  { display: flex; }

      .hamburger-fab {
        display: flex;
      }

      .sidebar {
        width: var(--sb-width) !important; /* always full width on mobile */
        transform: translateX(-100%);
        transition: transform var(--sb-transition);
        box-shadow: none;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 8px 0 40px rgba(0,0,0,0.5);
      }

      .collapsed .nav-text {
        opacity: 1;
        width: auto;
      }

      .collapsed .nav-section-label {
        opacity: 1;
        height: auto;
        padding: 6px 10px 6px;
      }
    }
  `]
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
