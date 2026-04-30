import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskList } from './task-list';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('TaskList Component', () => {
  let component: TaskList;
  let fixture: ComponentFixture<TaskList>;
  let taskServiceSpy: any;
  let authServiceSpy: any;
  let dialogSpy: any;
  let notifySpy: any;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    currentUserSubject = new BehaviorSubject<any>({ id: 1, name: 'Admin', role: 'admin' });

    taskServiceSpy = {
      getTasks: vi.fn().mockReturnValue(of([])),
      deleteTask: vi.fn(),
      updateTask: vi.fn()
    };
    authServiceSpy = {
      currentUser$: currentUserSubject.asObservable()
    };
    dialogSpy = {
      open: vi.fn()
    };
    notifySpy = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showInfo: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TaskList, NoopAnimationsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notifySpy }
      ]
    })
    .overrideProvider(MatDialog, { useValue: dialogSpy })
    .compileComponents();

    fixture = TestBed.createComponent(TaskList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should identify admin user', () => {
    expect(component.isAdmin).toBe(true);
  });

  it('should filter tasks by status', async () => {
    const tasks: any[] = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'completed' }
    ];
    taskServiceSpy.getTasks.mockReturnValue(of(tasks));
    component.loadTasks();
    
    component.applyFilter('pending');
    fixture.detectChanges();

    component.filteredTasks$.subscribe(filtered => {
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe(1);
    });
  });

  it('should open create dialog', () => {
    const afterClosedSubject = new BehaviorSubject<any>(true);
    const dialogRefSpy = { afterClosed: () => afterClosedSubject.asObservable() };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openCreateDialog();
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(notifySpy.showSuccess).toHaveBeenCalledWith('Task created successfully!');
  });

  it('should update task status', () => {
    const task: any = { id: 1, status: 'pending' };
    taskServiceSpy.updateTask.mockReturnValue(of({}));
    component.updateStatus(task, 'completed');
    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(1, { status: 'completed' });
    expect(notifySpy.showInfo).toHaveBeenCalled();
  });

  it('should delete task as admin', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    taskServiceSpy.deleteTask.mockReturnValue(of({}));
    component.deleteTask(1);
    expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith(1);
  });

  it('should not delete if confirm is false', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteTask(1);
    expect(taskServiceSpy.deleteTask).not.toHaveBeenCalled();
  });

  it('should not delete if not admin', () => {
    currentUserSubject.next({ id: 2, role: 'user' });
    component.deleteTask(1);
    expect(taskServiceSpy.deleteTask).not.toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    taskServiceSpy.deleteTask.mockReturnValue(throwError(() => 'error'));
    component.deleteTask(1);
    expect(notifySpy.showError).toHaveBeenCalled();
  });

  it('should open edit dialog', () => {
    const afterClosedSubject = new BehaviorSubject<any>(true);
    const dialogRefSpy = { afterClosed: () => afterClosedSubject.asObservable() };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openEditDialog({ id: 1 } as any);
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(notifySpy.showSuccess).toHaveBeenCalledWith('Task updated successfully!');
  });

  it('should open assign dialog', () => {
    const afterClosedSubject = new BehaviorSubject<any>(true);
    const dialogRefSpy = { afterClosed: () => afterClosedSubject.asObservable() };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openAssignDialog({ id: 1 } as any);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('should handle create dialog cancel', () => {
    const afterClosedSubject = new BehaviorSubject<any>(false);
    const dialogRefSpy = { afterClosed: () => afterClosedSubject.asObservable() };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openCreateDialog();
    expect(notifySpy.showSuccess).not.toHaveBeenCalled();
  });

  it('should handle edit dialog cancel', () => {
    const afterClosedSubject = new BehaviorSubject<any>(false);
    const dialogRefSpy = { afterClosed: () => afterClosedSubject.asObservable() };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openEditDialog({ id: 1 } as any);
    expect(notifySpy.showSuccess).not.toHaveBeenCalled();
  });

  it('should handle assign dialog cancel', () => {
    const afterClosedSubject = new BehaviorSubject<any>(false);
    const dialogRefSpy = { afterClosed: () => afterClosedSubject.asObservable() };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openAssignDialog({ id: 1 } as any);
    expect(notifySpy.showSuccess).not.toHaveBeenCalled(); // No success message in assign anyway, but covers branch
  });


  it('should not open assign dialog if not admin', () => {
    currentUserSubject.next({ id: 2, role: 'user' });
    component.openAssignDialog({ id: 1 } as any);
    expect(dialogSpy.open).not.toHaveBeenCalled();
  });

  it('should navigate to details', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    component.viewDetails(1);
    expect(router.navigate).toHaveBeenCalledWith(['/tasks', 1]);
  });

  it('should handle updateStatus error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const task: any = { id: 1 };
    taskServiceSpy.updateTask.mockReturnValue(throwError(() => 'error'));
    component.updateStatus(task, 'completed');
    expect(notifySpy.showError).toHaveBeenCalled();
  });

  it('should render tasks in the template', () => {
    const mockTasks = [{ id: 1, title: 'Task One', status: 'pending', project: { title: 'P1' } }];
    taskServiceSpy.getTasks.mockReturnValue(of(mockTasks));
    component.loadTasks();
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.task-table')).toBeTruthy();
    expect(compiled.textContent).toContain('Task One');
  });
});
