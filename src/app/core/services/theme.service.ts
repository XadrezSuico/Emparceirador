import { Injectable } from '@angular/core';

export type ThemeOption = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme-preference';
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.mediaQuery.addEventListener('change', () => {
      if (this.getThemePreference() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  public initTheme(): void {
    const savedTheme = this.getThemePreference();
    this.applyTheme(savedTheme);
  }

  public setTheme(theme: ThemeOption): void {
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  public getThemePreference(): ThemeOption {
    const theme = localStorage.getItem(this.THEME_KEY);
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme as ThemeOption;
    }
    return 'system'; // default
  }

  private applyTheme(theme: ThemeOption): void {
    let effectiveTheme: 'light' | 'dark' = 'light';
    
    if (theme === 'system') {
      effectiveTheme = this.mediaQuery.matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    document.documentElement.setAttribute('data-bs-theme', effectiveTheme);
  }
}
