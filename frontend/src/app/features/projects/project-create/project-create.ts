import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './project-create.html',
  styleUrl: './project-create.css'
})
export class ProjectCreate implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private dialogRef = inject(MatDialogRef<ProjectCreate>);
  
  projectForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: { project?: Project }) {
    if (data?.project) {
      this.isEditMode = true;
    }
  }

  ngOnInit(): void {
    this.projectForm = this.fb.group({
      title: [this.data?.project?.title || '', [Validators.required, Validators.maxLength(255)]],
      description: [this.data?.project?.description || ''],
      status: [this.data?.project?.status || 'active', Validators.required]
    });
  }

  onSubmit() {
    if (this.projectForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const projectData = this.projectForm.value;

    if (this.isEditMode && this.data?.project?.id) {
      this.projectService.updateProject(this.data.project.id, projectData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.dialogRef.close(res);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Update failed', err);
        }
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.dialogRef.close(res);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Create failed', err);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
