import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectList } from './project-list';
import { ProjectService } from '../../../core/services/project.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('ProjectList Component', () => {
  let component: ProjectList;
  let fixture: ComponentFixture<ProjectList>;
  let projectServiceSpy: any;
  let dialogSpy: any;
  let notifySpy: any;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    projectServiceSpy = {
      getProjects: vi.fn().mockReturnValue(of([])),
      deleteProject: vi.fn()
    };
    dialogSpy = {
      open: vi.fn()
    };
    notifySpy = {
      showSuccess: vi.fn(),
      showError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProjectList, NoopAnimationsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: NotificationService, useValue: notifySpy }
      ]
    })
      .overrideProvider(MatDialog, { useValue: dialogSpy })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate progress correctly', () => {
    const project: any = { tasks_count: 10, completed_tasks_count: 5 };
    expect(component.calculateProgress(project)).toBe(50);

    const projectNoTasks: any = { tasks_count: 0, completed_tasks_count: 0 };
    expect(component.calculateProgress(projectNoTasks)).toBe(0);
  });

  it('should open create dialog and refresh on success', () => {
    const dialogRefSpy = { afterClosed: () => of(true) };
    dialogSpy.open.mockReturnValue(dialogRefSpy);

    component.openCreateDialog();

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(projectServiceSpy.getProjects).toHaveBeenCalled();
    expect(notifySpy.showSuccess).toHaveBeenCalledWith('Project created successfully!');
  });

  it('should not refresh on create dialog cancel', () => {
    const dialogRefSpy = { afterClosed: () => of(false) };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openCreateDialog();
    expect(notifySpy.showSuccess).not.toHaveBeenCalled();
  });

  it('should open edit dialog and refresh on success', () => {
    const project: any = { id: 1, title: 'Test' };
    const dialogRefSpy = { afterClosed: () => of(true) };
    dialogSpy.open.mockReturnValue(dialogRefSpy);

    component.openEditDialog(project);

    expect(dialogSpy.open).toHaveBeenCalled();
    expect(notifySpy.showSuccess).toHaveBeenCalledWith('Project updated successfully!');
  });

  it('should not refresh on edit dialog cancel', () => {
    const dialogRefSpy = { afterClosed: () => of(false) };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openEditDialog({ id: 1 } as any);
    expect(notifySpy.showSuccess).not.toHaveBeenCalled();
  });

  it('should delete project after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    projectServiceSpy.deleteProject.mockReturnValue(of({}));

    component.deleteProject(1);

    expect(projectServiceSpy.deleteProject).toHaveBeenCalledWith(1);
    expect(notifySpy.showSuccess).toHaveBeenCalledWith('Project deleted.');
  });

  it('should not delete project if confirm is false', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteProject(1);
    expect(projectServiceSpy.deleteProject).not.toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    projectServiceSpy.deleteProject.mockReturnValue(throwError(() => ({ status: 500 })));

    component.deleteProject(1);

    expect(notifySpy.showError).toHaveBeenCalledWith('Failed to delete project.');
  });

  it('should navigate to project details', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    component.viewDetails(1);
    expect(router.navigate).toHaveBeenCalledWith(['projects', 1]);
  });
});
