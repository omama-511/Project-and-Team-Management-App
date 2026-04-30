import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      login: vi.fn()
    };
    routerSpy = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    
    const router = TestBed.inject(Router);
    routerSpy = { navigate: vi.spyOn(router, 'navigate').mockResolvedValue(true) };
    
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if form is invalid on submit', () => {
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should navigate to projects if admin logs in', () => {
    const mockRes = { user: { role: 'admin' } };
    authServiceSpy.login.mockReturnValue(of(mockRes));

    component.loginForm.setValue({ email: 'admin@test.com', password: 'password123' });
    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should navigate to tasks if user logs in', () => {
    const mockRes = { user: { role: 'user' } };
    authServiceSpy.login.mockReturnValue(of(mockRes));

    component.loginForm.setValue({ email: 'user@test.com', password: 'password123' });
    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should handle 401 error', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({ status: 401 })));

    component.loginForm.setValue({ email: 'test@test.com', password: 'password123' });
    component.onSubmit();

    expect(component.errorMessage).toBe('Incorrect email or password.');
  });

  it('should handle 422 error with validation messages', () => {
    const err = {
      status: 422,
      error: { errors: { email: ['Invalid email'], password: ['Too short'] } }
    };
    authServiceSpy.login.mockReturnValue(throwError(() => err));

    component.loginForm.setValue({ email: 'test@test.com', password: 'password123' });
    component.onSubmit();

    expect(component.errorMessage).toContain('Invalid email');
    expect(component.errorMessage).toContain('Too short');
  });

  it('should handle 404 error', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({ status: 404 })));
    component.loginForm.setValue({ email: 'nonexistent@test.com', password: 'password123' });
    component.onSubmit();
    expect(component.errorMessage).toBe('User account not found.');
  });

  it('should handle generic error', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({ error: { message: 'Server error' } })));
    component.loginForm.setValue({ email: 'test@test.com', password: 'password123' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Server error');
  });

  it('should handle generic error without message', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({})));
    component.loginForm.setValue({ email: 'test@test.com', password: 'password123' });
    component.onSubmit();
    expect(component.errorMessage).toBe('Unable to log in. Please check your credentials.');
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBe(true);
    component.hidePassword = false;
    expect(component.hidePassword).toBe(false);
  });
});

