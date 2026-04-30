import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDetail } from './project-detail';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProjectDetail Component', () => {
  let component: ProjectDetail;
  let fixture: ComponentFixture<ProjectDetail>;
  let projectServiceSpy: any;
  let authServiceSpy: any;
  let notifySpy: any;
  let dialogSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    projectServiceSpy = {
      getProject: vi.fn().mockReturnValue(of({ id: 1, title: 'Project 1', members: [{ id: 2, name: 'User 2', pivot: { role_in_project: 'member' } }] })),
      removeMember: vi.fn()
    };
    authServiceSpy = {
      currentUser$: new BehaviorSubject({ id: 1, role: 'admin' }).asObservable()
    };
    notifySpy = {
      showSuccess: vi.fn(),
      showError: vi.fn()
    };
    dialogSpy = {
      open: vi.fn()
    };
    routerSpy = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProjectDetail, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notifySpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        }
      ]
    })
    .overrideProvider(MatDialog, { useValue: dialogSpy })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(projectServiceSpy.getProject).toHaveBeenCalledWith(1);
  });

  it('should open add member dialog and reload on success', () => {
    const dialogRefSpy = { afterClosed: () => of(true) };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    component.openAddMemberDialog();
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(projectServiceSpy.getProject).toHaveBeenCalledTimes(2); // Initial + reload
  });

  it('should not reload on add member dialog cancel', () => {
    const dialogRefSpy = { afterClosed: () => of(false) };
    dialogSpy.open.mockReturnValue(dialogRefSpy);
    projectServiceSpy.getProject.mockClear();
    component.openAddMemberDialog();
    expect(projectServiceSpy.getProject).not.toHaveBeenCalled();
  });

  it('should remove member after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    projectServiceSpy.removeMember.mockReturnValue(of({}));
    projectServiceSpy.getProject.mockClear();
    component.removeMember(2);
    expect(projectServiceSpy.removeMember).toHaveBeenCalledWith(1, 2);
    expect(projectServiceSpy.getProject).toHaveBeenCalled();
  });

  it('should not remove member if confirm is false', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.removeMember(2);
    expect(projectServiceSpy.removeMember).not.toHaveBeenCalled();
  });

  it('should handle removeMember error', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    projectServiceSpy.removeMember.mockReturnValue(throwError(() => new Error('err')));
    component.removeMember(2);
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle loadProject error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    projectServiceSpy.getProject.mockReturnValue(throwError(() => new Error('err')));
    component.loadProject();
    component.project$.subscribe();
    expect(console.error).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should navigate back to projects', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('should navigate back if projectId is 0', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ProjectDetail, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notifySpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '0' } }
          }
        }
      ]
    })
    .overrideProvider(MatDialog, { useValue: dialogSpy })
    .compileComponents();

    const fixture0 = TestBed.createComponent(ProjectDetail);
    const component0 = fixture0.componentInstance;
    fixture0.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects']);
  });
});

