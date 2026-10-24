import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const AUTH_KEY = 'pandan_auth_expiry';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and have default preset credentials', () => {
    expect(service).toBeTruthy();
    expect(service.PRESET_USERNAME).toBeDefined();
    expect(service.PRESET_PASSWORD).toBeDefined();
    expect(service.EXPIRATION_DURATION_MS).toBe(240 * 60 * 60 * 1000);
  });

  describe('checkInitialAuth', () => {
    it('should be false when no stored expiry exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should be true when unexpired token exists in storage', () => {
      const futureExpiry = Date.now() + 60000;
      localStorage.setItem(AUTH_KEY, futureExpiry.toString());

      const newService = new AuthService();
      expect(newService.isAuthenticated()).toBe(true);
    });

    it('should logout and return false when stored token is expired', () => {
      const pastExpiry = Date.now() - 60000;
      localStorage.setItem(AUTH_KEY, pastExpiry.toString());

      const newService = new AuthService();
      expect(newService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(AUTH_KEY)).toBeNull();
    });

    it('should return false when stored token is invalid NaN', () => {
      localStorage.setItem(AUTH_KEY, 'invalid-timestamp');

      const newService = new AuthService();
      expect(newService.isAuthenticated()).toBe(false);
    });

    it('should handle localStorage getItem throwing an error', () => {
      spyOn(localStorage, 'getItem').and.throwError('SecurityException');
      const newService = new AuthService();
      expect(newService.isAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('should succeed with valid preset credentials and persist expiry', () => {
      const result = service.login(service.PRESET_USERNAME, service.PRESET_PASSWORD);
      expect(result.success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);

      const stored = localStorage.getItem(AUTH_KEY);
      expect(stored).not.toBeNull();
      const expiry = parseInt(stored!, 10);
      expect(expiry).toBeGreaterThan(Date.now());
    });

    it('should succeed with trimmed and case-insensitive username', () => {
      const result = service.login(`  ${service.PRESET_USERNAME.toUpperCase()}  `, service.PRESET_PASSWORD);
      expect(result.success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should reject invalid credentials', () => {
      const result = service.login('wrong-user', 'wrong-pass');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Incorrect username or password');
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(AUTH_KEY)).toBeNull();
    });

    it('should reject empty or null inputs', () => {
      const result = service.login('', '');
      expect(result.success).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should handle localStorage setItem throwing an error without throwing uncaught error', () => {
      spyOn(localStorage, 'setItem').and.throwError('QuotaExceeded');
      const result = service.login(service.PRESET_USERNAME, service.PRESET_PASSWORD);
      expect(result.success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should remove storage item and set isAuthenticated to false', () => {
      service.login(service.PRESET_USERNAME, service.PRESET_PASSWORD);
      expect(service.isAuthenticated()).toBe(true);

      service.logout();
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(AUTH_KEY)).toBeNull();
    });

    it('should handle localStorage removeItem throwing an error gracefully', () => {
      spyOn(localStorage, 'removeItem').and.throwError('StorageDisabled');
      expect(() => service.logout()).not.toThrow();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
