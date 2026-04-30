import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Register } from './register';
import { AuthService } from '../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('Register Component', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      register: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    vi.spyOn(routerSpy, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to login on success', () => {
    authServiceSpy.register.mockReturnValue(of({}));
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123'
    });
    component.onSubmit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set error on 422', () => {
    authServiceSpy.register.mockReturnValue(throwError(() => ({
      status: 422,
      error: { message: 'Email exists' }
    })));
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123'
    });
    component.onSubmit();
    expect(component.errorMessage).toContain('Email exists');
  });

  it('should show generic error for other statuses', () => {
    authServiceSpy.register.mockReturnValue(throwError(() => ({
      status: 500,
      error: { message: 'Server err' }
    })));
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123'
    });
    component.onSubmit();
    expect(component.errorMessage).toBe('Server err');
  });

  it('should show generic fallback error without message', () => {
    authServiceSpy.register.mockReturnValue(throwError(() => ({})));
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123'
    });
    component.onSubmit();
    expect(component.errorMessage).toBe('Registration failed. Email might be in use.');
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    component.hidePassword = true;
    component.hidePassword = false;
    expect(component.hidePassword).toBe(false);
  });
});


