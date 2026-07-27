import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Configured credentials from environment
  get PRESET_USERNAME(): string {
    return environment.appUsername || 'pandan';
  }

  get PRESET_PASSWORD(): string {
    return environment.appPassword || 'pandanyan2026';
  }

  private readonly AUTH_KEY = 'pandan_auth_expiry';
  // 240 hours in milliseconds (240 * 60 * 60 * 1000 = 864,000,000 ms)
  readonly EXPIRATION_DURATION_MS = 240 * 60 * 60 * 1000;

  // Angular Signal for reactive auth state
  isAuthenticated = signal<boolean>(this.checkInitialAuth());

  constructor() {}

  private checkInitialAuth(): boolean {
    try {
      const storedExpiry = localStorage.getItem(this.AUTH_KEY);
      if (!storedExpiry) return false;

      const expiryTimestamp = parseInt(storedExpiry, 10);
      if (isNaN(expiryTimestamp)) return false;

      const isValid = Date.now() < expiryTimestamp;
      if (!isValid) {
        this.logout();
      }
      return isValid;
    } catch (e) {
      return false;
    }
  }

  login(username: string, password: string): { success: boolean; message?: string } {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (cleanUser === this.PRESET_USERNAME && cleanPass === this.PRESET_PASSWORD) {
      try {
        const expiryTime = Date.now() + this.EXPIRATION_DURATION_MS;
        localStorage.setItem(this.AUTH_KEY, expiryTime.toString());
      } catch (e) {
        // ignore storage restriction
      }
      this.isAuthenticated.set(true);
      return { success: true };
    }

    return {
      success: false,
      message: 'Incorrect username or password. Please use the preset credentials.'
    };
  }

  logout(): void {
    try {
      localStorage.removeItem(this.AUTH_KEY);
    } catch (e) {
      // ignore storage restriction
    }
    this.isAuthenticated.set(false);
  }
}
