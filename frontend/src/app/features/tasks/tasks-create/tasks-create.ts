import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-tasks-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './tasks-create.html',
  styleUrl: './tasks-create.css'
})
export class TasksCreate implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<TasksCreate>);

  taskForm!: FormGroup;
  isEditMode = false;
  isAdmin = false;
  isSubmitting = false;
  projects$: Observable<Project[]> = of([]);
  users$: Observable<User[]> = of([]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { task?: Task, isAdmin?: boolean }) {
    if (data?.task) {
      this.isEditMode = true;
    }
    if (data?.isAdmin !== undefined) {
      this.isAdmin = data.isAdmin;
    } else {
      this.isAdmin = true; // default to true if not passed for create
    }
  }

  ngOnInit(): void {
    const currentAssigneeIds = this.data?.task?.assignees?.map(u => u.id) || [];

    this.taskForm = this.fb.group({
      project_id: [{ value: this.data?.task?.project_id || '', disabled: this.isEditMode }, Validators.required],
      title: [{ value: this.data?.task?.title || '', disabled: !this.isAdmin }, [Validators.required, Validators.maxLength(255)]],
      description: [{ value: this.data?.task?.description || '', disabled: !this.isAdmin }],
      status: [this.data?.task?.status || 'pending', Validators.required],
      priority: [{ value: this.data?.task?.priority || 'medium', disabled: !this.isAdmin }],
      due_date: [{ value: this.data?.task?.due_date || '', disabled: !this.isAdmin }],
      assignee_ids: [{ value: currentAssigneeIds, disabled: !this.isAdmin }]
    });

    if (this.isAdmin) {
      this.projects$ = this.projectService.getProjects();
      this.users$ = this.authService.getUsers();
    }
  }

  onSubmit() {
    if (this.taskForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    // get raw value to include disabled fields if needed, but we only send what's allowed
    const taskData = this.taskForm.getRawValue();

    if (taskData.due_date) {
      const d = new Date(taskData.due_date);
      const year = d.getFullYear();
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      taskData.due_date = `${year}-${month}-${day}`;
    }

    if (this.isEditMode && this.data?.task?.id) {
      this.taskService.updateTask(this.data.task.id, taskData).subscribe({
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
      this.taskService.createTask(taskData).subscribe({
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
