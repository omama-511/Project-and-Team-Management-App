import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TaskAssign } from './task-assign';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TaskAssign Component', () => {
  let component: TaskAssign;
  let fixture: ComponentFixture<TaskAssign>;
  let taskServiceSpy: any;
  let authServiceSpy: any;
  let dialogRefSpy: any;

  beforeEach(async () => {
    taskServiceSpy = {
      assignUser: vi.fn()
    };
    authServiceSpy = {
      getUsers: vi.fn().mockReturnValue(of([]))
    };
    dialogRefSpy = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TaskAssign, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { task: { id: 1 } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAssign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(authServiceSpy.getUsers).toHaveBeenCalled();
  });

  it('should assign user and close dialog', () => {
    taskServiceSpy.assignUser.mockReturnValue(of({ success: true }));
    component.assignForm.patchValue({ user_id: 2 });
    component.onSubmit();
    expect(taskServiceSpy.assignUser).toHaveBeenCalledWith(1, 2);
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ success: true });
  });

  it('should handle assign error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    taskServiceSpy.assignUser.mockReturnValue(throwError(() => 'err'));
    component.assignForm.patchValue({ user_id: 2 });
    component.onSubmit();
    expect(console.error).toHaveBeenCalled();
  });

  it('should close on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.assignForm.patchValue({ user_id: null });
    component.onSubmit();
    expect(taskServiceSpy.assignUser).not.toHaveBeenCalled();
  });
});
