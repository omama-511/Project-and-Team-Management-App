import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-project-member-assign',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './project-member-assign.html',
  styleUrl: './project-member-assign.css'
})
export class ProjectMemberAssign implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<ProjectMemberAssign>);

  memberForm!: FormGroup;
  users: User[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { projectId: number }) { }

  ngOnInit(): void {
    this.memberForm = this.fb.group({
      user_id: ['', Validators.required],
      role_in_project: ['Member', Validators.required]
    });

    this.authService.getUsers().subscribe(users => this.users = users);
  }

  onSubmit() {
    if (this.memberForm.invalid) return;

    const { user_id, role_in_project } = this.memberForm.value;

    this.projectService.addMember(this.data.projectId, user_id, role_in_project).subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error('Add member failed', err)
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
