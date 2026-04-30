import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: any;
  let notifySpy: any;
  let routerSpy: any;

  const mockUser = { id: 1, name: 'John Doe', email: 'john@test.com' };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    authServiceSpy = {
      currentUser$: of(mockUser),
      updateProfile: vi.fn()
    };
    notifySpy = {
      showSuccess: vi.fn(),
      showError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notifySpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    routerSpy = TestBed.inject(Router);
    vi.spyOn(routerSpy, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with current user data', () => {
    expect(component.profileForm.value.name).toBe(mockUser.name);
    expect(component.profileForm.value.email).toBe(mockUser.email);
  });

  it('should update profile successfully without password', () => {
    authServiceSpy.updateProfile.mockReturnValue(of({ success: true }));
    
    component.profileForm.patchValue({ name: 'Updated Name' });
    component.onSubmit();

    expect(authServiceSpy.updateProfile).toHaveBeenCalledWith({
      name: 'Updated Name',
      email: mockUser.email
    });
    expect(notifySpy.showSuccess).toHaveBeenCalled();
  });

  it('should update profile with password', () => {
    authServiceSpy.updateProfile.mockReturnValue(of({ success: true }));
    
    component.profileForm.patchValue({
      name: 'Updated Name',
      current_password: 'oldpassword',
      password: 'newpassword123',
      password_confirmation: 'newpassword123'
    });
    component.onSubmit();

    expect(authServiceSpy.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      password: 'newpassword123'
    }));
  });

  it('should handle update error', () => {
    authServiceSpy.updateProfile.mockReturnValue(throwError(() => ({ status: 400 })));
    component.onSubmit();
    expect(notifySpy.showError).toHaveBeenCalled();
  });

  it('should handle 422 validation error', () => {
    const errorRes = {
      status: 422,
      error: {
        errors: {
          email: ['The email has already been taken.']
        }
      }
    };
    authServiceSpy.updateProfile.mockReturnValue(throwError(() => errorRes));
    component.onSubmit();
    expect(notifySpy.showError).toHaveBeenCalledWith('The email has already been taken.');
  });

  it('should navigate to home on cancel', () => {
    component.onCancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should toggle password visibility', () => {
    expect(component.hideCurrentPassword).toBe(true);
    component.hideCurrentPassword = false;
    expect(component.hideCurrentPassword).toBe(false);

    expect(component.hidePassword).toBe(true);
    component.hidePassword = false;
    expect(component.hidePassword).toBe(false);
  });

  it('should show error messages in the template', () => {
    component.profileForm.get('name')?.setValue('');
    component.profileForm.get('name')?.markAsTouched();
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-error').textContent).toContain('Name is required');
  });

  it('should render profile form', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.profile-card')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="name"]')).toBeTruthy();
  });

  it('should not patch form if user is null', () => {
    TestBed.resetTestingModule();
    const nullUserAuthSpy = { ...authServiceSpy, currentUser$: of(null) };
    TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: nullUserAuthSpy },
        { provide: NotificationService, useValue: notifySpy }
      ]
    }).compileComponents();
    const nullFixture = TestBed.createComponent(ProfileComponent);
    const nullComponent = nullFixture.componentInstance;
    nullFixture.detectChanges();
    expect(nullComponent.profileForm.value.name).toBe('');
  });

  it('should send password fields if password is provided', () => {
    authServiceSpy.updateProfile.mockReturnValue(of({}));
    component.profileForm.patchValue({
      name: 'John',
      email: 'john@test.com',
      current_password: 'oldpassword',
      password: 'newpassword123',
      password_confirmation: 'newpassword123'
    });
    component.onSubmit();
    expect(authServiceSpy.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      password: 'newpassword123'
    }));
  });

  it('should handle generic error', () => {
    authServiceSpy.updateProfile.mockReturnValue(throwError(() => ({ status: 500, error: { message: 'Server error' } })));
    component.profileForm.patchValue({ name: 'John', email: 'john@test.com' });
    component.onSubmit();
    expect(notifySpy.showError).toHaveBeenCalledWith('Server error');
  });
});
