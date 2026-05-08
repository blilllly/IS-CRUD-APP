import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getToken retorna null cuando no hay sesión iniciada', () => {
    expect(service.getToken()).toBeNull();
  });

  it('isLoggedIn retorna false cuando no hay token almacenado', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isLoggedIn retorna true cuando existe un token en localStorage', () => {
    localStorage.setItem('auth_token', 'fake-jwt-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout elimina el token y deja isLoggedIn en false', () => {
    localStorage.setItem('auth_token', 'fake-jwt-token');
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });
});
