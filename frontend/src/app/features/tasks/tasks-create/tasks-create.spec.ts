import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TasksCreate } from './tasks-create';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TasksCreate Component', () => {
  let component: TasksCreate;
  let fixture: ComponentFixture<TasksCreate>;
  let taskServiceSpy: any;
  let projectServiceSpy: any;
  let authServiceSpy: any;
  let dialogRefSpy: any;

  beforeEach(async () => {
    taskServiceSpy = {
      createTask: vi.fn(),
      updateTask: vi.fn()
    };
    projectServiceSpy = {
      getProjects: vi.fn().mockReturnValue(of([]))
    };
    authServiceSpy = {
      getUsers: vi.fn().mockReturnValue(of([]))
    };
    dialogRefSpy = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TasksCreate, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { isAdmin: true } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form for creation with projects and users', () => {
    expect(component.isEditMode).toBe(false);
    expect(projectServiceSpy.getProjects).toHaveBeenCalled();
    expect(authServiceSpy.getUsers).toHaveBeenCalled();
  });

  it('should create task and close dialog on success', () => {
    taskServiceSpy.createTask.mockReturnValue(of({ id: 1 }));
    component.taskForm.patchValue({ title: 'New Task', project_id: 1, status: 'pending' });
    component.onSubmit();
    expect(taskServiceSpy.createTask).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ id: 1 });
  });

  it('should update task as admin', async () => {
    // Re-create with task data
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TasksCreate, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { task: { id: 1, title: 'Old' }, isAdmin: true } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TasksCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();

    taskServiceSpy.updateTask.mockReturnValue(of({ id: 1 }));
    component.onSubmit();
    expect(taskServiceSpy.updateTask).toHaveBeenCalled();
  });

  it('should handle creation error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    taskServiceSpy.createTask.mockReturnValue(throwError(() => 'error'));
    component.taskForm.patchValue({ title: 'New Task', project_id: 1, status: 'pending' });
    component.onSubmit();
    expect(console.error).toHaveBeenCalledWith('Create failed', 'error');
  });

  it('should handle update error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    component.isEditMode = true;
    component.data = { task: { id: 1 } } as any;
    taskServiceSpy.updateTask.mockReturnValue(throwError(() => 'error'));
    component.taskForm.patchValue({ title: 'New Task', project_id: 1, status: 'pending' });
    component.onSubmit();
    expect(console.error).toHaveBeenCalledWith('Update failed', 'error');
  });

  it('should close on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should default isAdmin to true if not provided', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TasksCreate, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TasksCreate);
    component = fixture.componentInstance;
    expect(component.isAdmin).toBe(true);
  });

  it('should handle isAdmin false', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TasksCreate, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { isAdmin: false } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TasksCreate);
    component = fixture.componentInstance;
    component.isAdmin = false;
    projectServiceSpy.getProjects.mockClear();
    fixture.detectChanges();
    expect(component.isAdmin).toBe(false);
    expect(projectServiceSpy.getProjects).not.toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.taskForm.patchValue({ title: '' });
    component.onSubmit();
    expect(taskServiceSpy.createTask).not.toHaveBeenCalled();
  });
});
