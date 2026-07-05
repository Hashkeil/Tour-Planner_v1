import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly key = 'theme';

  theme = signal<Theme>(this.readStored());

  constructor() {
    this.apply(this.theme());
  }

  setTheme(theme: Theme): void {
    localStorage.setItem(this.key, theme);
    this.theme.set(theme);
    this.apply(theme);
  }

  private readStored(): Theme {
    const stored = localStorage.getItem(this.key);
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  }

  private apply(theme: Theme): void {
    const root = document.documentElement;
    if (theme === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }
}
