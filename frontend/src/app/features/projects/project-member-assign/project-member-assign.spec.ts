import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ProjectMemberAssign } from './project-member-assign';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProjectMemberAssign Component', () => {
  let component: ProjectMemberAssign;
  let fixture: ComponentFixture<ProjectMemberAssign>;
  let projectServiceSpy: any;
  let authServiceSpy: any;
  let dialogRefSpy: any;

  beforeEach(async () => {
    projectServiceSpy = {
      addMember: vi.fn()
    };
    authServiceSpy = {
      getUsers: vi.fn().mockReturnValue(of([]))
    };
    dialogRefSpy = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProjectMemberAssign, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { projectId: 1 } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectMemberAssign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(authServiceSpy.getUsers).toHaveBeenCalled();
  });

  it('should add member and close dialog', () => {
    projectServiceSpy.addMember.mockReturnValue(of({ success: true }));
    component.memberForm.patchValue({ user_id: 2, role_in_project: 'Admin' });
    component.onSubmit();
    expect(projectServiceSpy.addMember).toHaveBeenCalledWith(1, 2, 'Admin');
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ success: true });
  });

  it('should close on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should handle add member error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    projectServiceSpy.addMember.mockReturnValue(throwError(() => 'err'));
    component.memberForm.patchValue({ user_id: 2 });
    component.onSubmit();
    expect(console.error).toHaveBeenCalled();
  });
});
