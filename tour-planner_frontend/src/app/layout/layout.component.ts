import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      width: 100%;
      height: 100vh;
      background: var(--bg-body);
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--bg-body);
      transition: margin-left 0.3s ease, background 0.2s ease;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }

    .main-content::-webkit-scrollbar {
      width: 8px;
    }

    .main-content::-webkit-scrollbar-track {
      background: rgba(88, 166, 255, 0.05);
    }

    .main-content::-webkit-scrollbar-thumb {
      background: rgba(88, 166, 255, 0.3);
      border-radius: 4px;
    }

    .main-content::-webkit-scrollbar-thumb:hover {
      background: rgba(88, 166, 255, 0.5);
    }
  `]
})
export class LayoutComponent {}

