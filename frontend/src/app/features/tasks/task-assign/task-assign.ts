import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-task-assign',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './task-assign.html',
  styleUrl: './task-assign.css'
})
export class TaskAssign implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<TaskAssign>);
  
  assignForm!: FormGroup;
  users: User[] = [];
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: { task: Task }) {}

  ngOnInit(): void {
    this.assignForm = this.fb.group({
      user_id: ['', Validators.required]
    });

    this.authService.getUsers().subscribe(users => this.users = users);
  }

  onSubmit() {
    if (this.assignForm.invalid) return;

    const { user_id } = this.assignForm.value;
    
    this.taskService.assignUser(this.data.task.id, user_id).subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => console.error('Assign failed', err)
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
