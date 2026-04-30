import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ProjectCreate } from './project-create';
import { ProjectService } from '../../../core/services/project.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProjectCreate Component', () => {
  let component: ProjectCreate;
  let fixture: ComponentFixture<ProjectCreate>;
  let projectServiceSpy: any;
  let dialogRefSpy: any;

  beforeEach(async () => {
    projectServiceSpy = {
      createProject: vi.fn(),
      updateProject: vi.fn()
    };
    dialogRefSpy = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProjectCreate, ReactiveFormsModule, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form for creation', () => {
    expect(component.isEditMode).toBe(false);
    expect(component.projectForm.value).toEqual({
      title: '',
      description: '',
      status: 'active'
    });
  });

  it('should create project and close dialog on success', () => {
    projectServiceSpy.createProject.mockReturnValue(of({ id: 1 }));
    component.projectForm.patchValue({ title: 'New Proj', description: 'Desc' });
    component.onSubmit();
    expect(projectServiceSpy.createProject).toHaveBeenCalledWith({ title: 'New Proj', description: 'Desc', status: 'active' });
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ id: 1 });
  });

  it('should update project if in edit mode', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProjectCreate, ReactiveFormsModule, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { project: { id: 1, title: 'Old Title', description: 'Old Desc' } } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isEditMode).toBe(true);
    projectServiceSpy.updateProject.mockReturnValue(of({ id: 1 }));
    component.projectForm.patchValue({ title: 'New Title' });
    component.onSubmit();
    expect(projectServiceSpy.updateProject).toHaveBeenCalledWith(1, { title: 'New Title', description: 'Old Desc', status: 'active' });
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ id: 1 });
  });

  it('should handle create error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    projectServiceSpy.createProject.mockReturnValue(throwError(() => new Error('err')));
    component.projectForm.patchValue({ title: 'Test' });
    component.onSubmit();
    expect(console.error).toHaveBeenCalled();
  });

  it('should close on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.projectForm.patchValue({ title: '' });
    component.onSubmit();
    expect(projectServiceSpy.createProject).not.toHaveBeenCalled();
  });
});

