import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarSpy: any;

  beforeEach(() => {
    snackBarSpy = {
      open: (message: string, action: string, config: any) => {}
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success snackbar', () => {
    const spy = vi.spyOn(snackBarSpy, 'open');
    service.showSuccess('Success Message');
    expect(spy).toHaveBeenCalledWith('Success Message', 'Close', expect.objectContaining({
      panelClass: ['success-snackbar']
    }));
  });

  it('should show error snackbar', () => {
    const spy = vi.spyOn(snackBarSpy, 'open');
    service.showError('Error Message');
    expect(spy).toHaveBeenCalledWith('Error Message', 'Close', expect.objectContaining({
      panelClass: ['error-snackbar']
    }));
  });

  it('should show info snackbar', () => {
    const spy = vi.spyOn(snackBarSpy, 'open');
    service.showInfo('Info Message');
    expect(spy).toHaveBeenCalledWith('Info Message', 'Close', expect.any(Object));
  });
});
