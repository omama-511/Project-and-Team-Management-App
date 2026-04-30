import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserList } from './user-list';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserList Component', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;
  let authServiceSpy: any;
  let notifySpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      currentUser$: new BehaviorSubject({ id: 1, name: 'Admin', role: 'admin' }).asObservable(),
      getUsers: vi.fn().mockReturnValue(of([{ id: 1, name: 'John Doe', email: 'j@d.com', role: 'user' }])),
      updateUserRole: vi.fn()
    };
    notifySpy = {
      showSuccess: vi.fn(),
      showError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserList, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notifySpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle role to admin on confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    authServiceSpy.updateUserRole.mockReturnValue(of({}));
    component.toggleRole({ id: 2, name: 'Test', role: 'user' } as any);
    expect(authServiceSpy.updateUserRole).toHaveBeenCalledWith(2, 'admin');
    expect(notifySpy.showSuccess).toHaveBeenCalled();
  });

  it('should not toggle role if not confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.toggleRole({ id: 2, name: 'Test', role: 'user' } as any);
    expect(authServiceSpy.updateUserRole).not.toHaveBeenCalled();
  });

  it('should toggle role to user if already admin', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    authServiceSpy.updateUserRole.mockReturnValue(of({}));
    component.toggleRole({ id: 2, name: 'Test', role: 'admin' } as any);
    expect(authServiceSpy.updateUserRole).toHaveBeenCalledWith(2, 'user');
  });

  it('should handle toggle error', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    authServiceSpy.updateUserRole.mockReturnValue(throwError(() => ({ error: { message: 'err' } })));
    component.toggleRole({ id: 2, name: 'Test', role: 'user' } as any);
    expect(notifySpy.showError).toHaveBeenCalledWith('err');
  });

  it('should handle toggle error without message', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    authServiceSpy.updateUserRole.mockReturnValue(throwError(() => ({})));
    component.toggleRole({ id: 2, name: 'Test', role: 'user' } as any);
    expect(notifySpy.showError).toHaveBeenCalledWith('Failed to update role.');
  });
  
  it('should render users in the table', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.user-table')).toBeTruthy();
  });
});
